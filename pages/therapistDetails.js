// pages/therapistDetails.js
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import styles from "../styles/therapistDetails.module.css";
import BookingModal from "../components/BookingModal";
import LoginModal from "../components/LoginModal";

// Local YYYY-MM-DD (no UTC day shift)
const formatDate = (d) =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate()).toLocaleDateString(
    "en-CA"
  );

const toLocalDateObj = (iso) => {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
};

export default function TherapistDetails() {
  const [therapist, setTherapist] = useState(null);

  // Availability
  const [availability, setAvailability] = useState([]); // [{ date: "YYYY-MM-DD", slots: ["09:00", ...] }]
  const [loadingAvail, setLoadingAvail] = useState(false);
  const [availError, setAvailError] = useState("");

  // Selections
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [callType, setCallType] = useState("");

  // Booking
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Dummy reviews
  const [rating] = useState(4.2);
  const reviews = [
    {
      name: "Justin Lewis",
      stars: 4,
      text: "Bringing the girl to my doorstep was the best decision ever!",
    },
    {
      name: "Cameron Wright",
      stars: 4,
      text: "Great experience and on-time service.",
    },
    {
      name: "Tyler Mitchell",
      stars: 4,
      text: "Loved the experience. Will book again.",
    },
  ];

  // Load therapist + availability
  useEffect(() => {
    try {
      const stored = localStorage.getItem("selectedTherapist");
      if (stored) {
        const t = JSON.parse(stored);
        setTherapist(t);

        // Fetch availability for therapist.id
        const controller = new AbortController();
        (async () => {
          try {
            setLoadingAvail(true);
            setAvailError("");
            const url = `https://tsm.spagram.com/api/availability.php?modelid=${encodeURIComponent(
              t.id
            )}`;
            const res = await axios.get(url, { signal: controller.signal });

            // Accept either a bare array or { data: [...] }
            const list = Array.isArray(res.data)
              ? res.data
              : Array.isArray(res.data?.data)
              ? res.data.data
              : [];

            setAvailability(list);
            if (list.length > 0) setSelectedDate(list[0].date);
          } catch (e) {
            if (e.name !== "CanceledError") {
              setAvailError("Failed to load availability.");
            }
          } finally {
            setLoadingAvail(false);
          }
        })();

        return () => controller.abort();
      }
    } catch {
      // ignore parse errors
    }
  }, []);

  // Reset slot when date changes
  useEffect(() => setSelectedSlot(null), [selectedDate]);

  // Filter valid slots (hide past hours for today)
  const validSlots = useMemo(() => {
    if (!selectedDate) return [];
    const record = availability.find((d) => d.date === selectedDate);
    if (!record) return [];

    const todayStr = formatDate(new Date());
    if (selectedDate !== todayStr) return record.slots || [];

    const nowHour = new Date().getHours();
    return (record.slots || []).filter(
      (slot) => parseInt(slot.split(":")[0], 10) > nowHour
    );
  }, [availability, selectedDate]);

  // Booking validation
  const validateBookingData = () => {
    const customerId = localStorage.getItem("customertoken");
    const hasCustomerId = !!customerId;
    const hasTherapist = !!therapist;
    const hasCallType = !!callType;
    const hasDate = !!selectedDate;
    const hasSlot = !!selectedSlot;
    const hasServiceAddress = !!(
      therapist?.service_area_primary || therapist?.service_area
    );

    return {
      isValid:
        hasCustomerId &&
        hasTherapist &&
        hasCallType &&
        hasDate &&
        hasSlot &&
        hasServiceAddress,
      missing: {
        customerId: !hasCustomerId,
        therapist: !hasTherapist,
        callType: !hasCallType,
        date: !hasDate,
        slot: !hasSlot,
        serviceAddress: !hasServiceAddress,
      },
    };
  };

  // Create booking against API
  const createBooking = async () => {
    const customerId = localStorage.getItem("customertoken");

    if (!customerId) {
      setSaveError("Please log in to make a booking.");
      return;
    }

    // Ensure zero-padded hour so PHP 'H:i:s' parser accepts it
    const [h, m] = selectedSlot.split(":");
    const hh = String(h).padStart(2, "0");
    const service_time = `${selectedDate} ${hh}:${m}:00`; // "YYYY-MM-DD HH:mm:ss"

    const payload = {
      customer_id: customerId,
      model_id: therapist.id,
      service_time,
      call_type: callType, // "incall" | "outcall"
      service_address:
        therapist.service_area_primary || therapist.service_area || "",
      price: therapist.price,
    };

    try {
      setSaving(true);
      setSaveError("");

      const res = await axios.post(
        "https://tsm.spagram.com/api/create-order.php",
        payload,
        { headers: { "Content-Type": "application/json" } }
      );

      const ok = res.data === "1" || res.data?.success === "1";
      if (!ok) {
        throw new Error(res.data?.message || "Booking failed");
      }
      setShowBookingModal(true);
    } catch (e) {
      setSaveError(e?.message || "Could not create booking.");
    } finally {
      setSaving(false);
    }
  };

  const handleBookNow = () => {
    const { isValid, missing } = validateBookingData();

    if (!isValid) {
      if (missing.customerId) {
        setSaveError("Please log in to make a booking.");
      } else if (missing.callType) {
        setSaveError("Please select call type (in-call or out-call).");
      } else if (missing.date) {
        setSaveError("Please select a date.");
      } else if (missing.slot) {
        setSaveError("Please select a time slot.");
      } else if (missing.serviceAddress) {
        setSaveError("Service address information is missing.");
      } else {
        setSaveError("Please complete all booking information.");
      }
      return;
    }
    createBooking();
  };

  return (
    <div className={styles.wrapper}>
      {therapist ? (
        <div className={styles.layout}>
          {/* Left panel */}
          <div className={styles.leftPanel}>
            <img
              src={therapist.picture_url || "/images/default.jpg"}
              alt={therapist.name}
              className={styles.profilePic}
            />
            <div className={styles.details}>
              <p>
                <strong>Name:</strong> {therapist.name}
              </p>
              <p>
                <strong>Service Areas:</strong>{" "}
                {therapist.service_area_primary || therapist.service_area}
              </p>
              <p>
                <strong>Price:</strong> ${therapist.price}/hr
              </p>
              <p>
                <strong>Gender:</strong> {therapist.gender}
              </p>
              <p>
                <strong>Ethnicities:</strong> {therapist.ethnicity}
              </p>
              <p>
                <strong>Height:</strong> {therapist.height}
              </p>
              <p>
                <strong>Age:</strong> {therapist.age}
              </p>
            </div>
          </div>

          {/* Right panel */}
          <div className={styles.rightPanel}>
            <h3>Make an Appointment with {therapist.name}</h3>
            <p>
              Booking fee is $
              {therapist?.price ? (therapist.price * 0.1).toFixed(2) : "—"} (10%
              of ${therapist?.price ?? "—"})
            </p>

            <div className={styles.callTypeGroup}>
              <label>
                <input
                  type="radio"
                  name="calltype"
                  value="incall"
                  checked={callType === "incall"}
                  onChange={(e) => setCallType(e.target.value)}
                />
                inCall
              </label>
              <label>
                <input
                  type="radio"
                  name="calltype"
                  value="outcall"
                  checked={callType === "outcall"}
                  onChange={(e) => setCallType(e.target.value)}
                />
                outCall
              </label>
            </div>

            {loadingAvail && <p>Loading availability…</p>}
            {!loadingAvail && availError && <p>{availError}</p>}

            {!loadingAvail && !availError && availability.length > 0 && (
              <div className={styles.datesRow}>
                {availability.map((day) => (
                  <div
                    key={day.date}
                    className={`${styles.dateBlock} ${
                      selectedDate === day.date ? styles.active : ""
                    }`}
                    onClick={() => setSelectedDate(day.date)}
                  >
                    <div>
                      {toLocalDateObj(day.date)
                        .toLocaleDateString("en-US", { weekday: "short" })
                        .toUpperCase()}
                    </div>
                    <div>{toLocalDateObj(day.date).getDate()}</div>
                  </div>
                ))}
              </div>
            )}

            {!loadingAvail && !availError && selectedDate && (
              <div className={styles.slots}>
                {validSlots.length > 0 ? (
                  validSlots.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      className={`${styles.slot} ${
                        selectedSlot === slot ? styles.selectedSlot : ""
                      }`}
                      onClick={() => setSelectedSlot(slot)}
                    >
                      {slot}
                    </button>
                  ))
                ) : (
                  <p>No available time slots for this date.</p>
                )}
              </div>
            )}

            {saveError && (
              <div className={styles.error}>
                <p>{saveError}</p>
                {saveError.toLowerCase().includes("log in") && (
                  <button
                    className={styles.loginButton}
                    onClick={() => setShowLoginModal(true)}
                    type="button"
                  >
                    Go to Login
                  </button>
                )}
              </div>
            )}

            <button
              className={styles.bookButton}
              onClick={handleBookNow}
              disabled={saving}
              title="Complete all selections to enable booking"
              type="button"
            >
              {saving ? "Booking…" : "Book Now"}
            </button>
          </div>
        </div>
      ) : (
        <p>Loading therapist details…</p>
      )}

      {/* Reviews */}
      <div className={styles.reviewSection}>
        <h3>Average Rating</h3>
        <div className={styles.stars}>
          {"⭐".repeat(Math.round(rating))}
          {"☆".repeat(5 - Math.round(rating))}
        </div>

        <div className={styles.reviewGrid}>
          {reviews.map((r, i) => (
            <div className={styles.reviewItem} key={i}>
              <strong>{r.name}</strong>
              <div className={styles.stars}>
                {"⭐".repeat(r.stars)}
                {"☆".repeat(5 - r.stars)}
              </div>
              <p>{r.text}</p>
            </div>
          ))}
        </div>

        <a href="#" className={styles.loadMore}>
          Load more.
        </a>
      </div>

      {showBookingModal && (
        <BookingModal
          therapist={therapist}
          selectedDate={selectedDate}
          selectedSlot={selectedSlot}
          callType={callType}
          onClose={() => setShowBookingModal(false)}
        />
      )}

      {showLoginModal && (
        <LoginModal user="customer" onClose={() => setShowLoginModal(false)} />
      )}
    </div>
  );
}
