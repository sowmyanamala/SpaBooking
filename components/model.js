import React, { useState, useEffect } from "react";
import utilStyles from "../styles/utils.module.css";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";

//
function Model({
  slug,
  photoOnlyView,
  date,
  time,
  id,
  picture_url,
  name,
  service_area_primary,
  service_area,
  price,
  services_prices,
  gender,
  color,
  height,
  availability,
}) {
  const router = useRouter();
  const [isActive, setActive] = useState(true);

  function toggleinfo(isActive) {
    isActive ? setActive(photoOnlyView) : setActive(photoOnlyView);
  }
  const handleClick = () => {
    let singleModelApiUrl =
      "https://tsm.spagram.com/api/models.php?id=" +
      id +
      "&date=" +
      date +
      "&time=" +
      time;
    let setvalue = localStorage.setItem("singleModelApiUrl", singleModelApiUrl);
    router.push({
      pathname: "/" + slug,
    });
  };

  useEffect(() => {
    const hell = () => {
      console.log("show", photoOnlyView);
    };

    hell();
  }, [isActive]);
  // Don't render if name is empty
  if (!name || name.trim() === "") {
    return null;
  }

  return (
    <div onClick={handleClick} className={utilStyles.model}>
      {/* <div onClick={()=>toggleinfo(isActive)} className={utilStyles.model}> */}
      <div className={utilStyles.modelimgCnt}>
        <img
          className={utilStyles.modelimg}
          src={picture_url || "/images/model.jpeg"}
          alt={name || "Therapist"}
        />
      </div>
      <div className={photoOnlyView ? "hide" : "show"}>
        <h2 className={utilStyles.modelName}>{name || "Unknown Therapist"}</h2>

        <div className={utilStyles.location}>
          <img
            alt="location icon"
            width="20"
            src="https://tsm.spagram.com/api/images/location.png"
          />
          {/* <span> {service_area.replace(/,/g, ', ')} </span> */}
          <span> {service_area_primary || "Service Area"} </span>
        </div>
        {/* <p>{services_prices}</p> */}
      </div>
    </div>
  );
}

export default Model;
