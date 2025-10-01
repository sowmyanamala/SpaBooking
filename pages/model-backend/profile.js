import React, { useState, useEffect } from "react";
import Head from "next/head";
import Layout, { siteTitle } from "../../components/model/layout";
import GalleryImages from "../../components/galleryImages";

import modelCss from "../../styles/model.module.css";
import ServicePricesUI from "../../components/servicePricesUI";
import withAuth from "../../components/model/withAuth";
import Ethnicities from "../../components/data/ethnicities.js";
import Services from "../../components/data/services.js";
import axios from "axios";

//name,phone,email,gender,height,color,about,service_area,servicePrices,image,

const Profile = () => {
  // const originalUrl = 'https://tsm.spagram.com/api/models.php';
  // const [baseUrl, setBaseUrl] = useState(originalUrl);
  // const [servPri, setServPri] = useState([
  //   { id: 1, name: 'Service 1', Price: '10' },
  //   { id: 2, name: 'Service 2', Price: '20' }
  // ]);

  // [{"id": "1", "name":"Swedish massage","Price":"44"}, {"id": "2", "name":"Deep massage","Price":"144"}]

  // const [selectedAreas, setSelectedAreas] = useState([]);
  const [initialMSg, setInitialMSg] = useState("");
  const [servPri, setServPri] = useState(null);
  const [inputs, setInputs] = useState([]);
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(null);
  const [error, setError] = useState(null);
  const [id, setId] = useState(null);
  const [model, setModel] = useState({
    modelId: "",
    slug: "",
    name: "",
    phone: "",
    email: "",
    gender: "",
    selectedAreas_primary: "",
    selectedAreas: Array(),
    location_type: Array(),
    incall_location: "",
    services: "",
    price: "",
    ethnicity: "",
    age: "",
    height: "",
    color: "",
    about: "",
    service_area: "",
    servicePrices: null,
    picture_url: "",
    picture_urls: "",
    status: "",
  });

  const areas = [
    {
      label: "New York",
      options: [
        "Albany",
        "Binghamton",
        "Buffalo",
        "Catskills",
        "Chautauqua",
        "Elmira-corning",
        "Finger lakes",
        "Glens falls",
        "Hudson valley",
        "Ithaca",
        "Long island",
        "Manhattan",
        "Brooklyn",
        "Queens",
        "Bronx",
        "Staten Island",
        "New Jersey",
        "Long Island",
        "Westchester",
        "Fairfield",
        "Oneonta",
        "Plattsburgh-adirondacks",
        "Potsdam-canton-massena",
        "Rochester",
        "Syracuse",
        "Twin tiers NY/PA",
        "Utica-rome-oneida",
        "Watertown",
      ],
    },
    {
      label: "New Jersey",
      options: [
        "Central NJ",
        "Jersey shore",
        "North jersey",
        "South jersey",
        "NJ suburbs of NYC (subregion of NYC site)",
      ],
    },
    {
      label: "Connecticut",
      options: [
        "Eastern CT",
        "Hartford",
        "New haven",
        "Northwest CT",
        "Fairfield county (subregion of NYC site)",
      ],
    },
  ];

  const [selectedServices, setSelectedServices] = useState([]);

  const handleServiceChange = (event) => {
    const { name, checked } = event.target;
    if (checked) {
      setSelectedServices([...selectedServices, name]);
    } else {
      setSelectedServices(
        selectedServices.filter((service) => service !== name)
      );
    }
  };

  const handleAreaChangePrimary = (event) => {
    const selectedOptions = Array.from(event.target.selectedOptions).map(
      (option) => option.value
    );
    setModel({ ...model, selectedAreas_primary: selectedOptions });
  };

  const handleAreaChange = (event) => {
    const selectedOptions = Array.from(event.target.selectedOptions).map(
      (option) => option.value
    );
    setModel({ ...model, selectedAreas: selectedOptions });
  };

  const handleLocationTypeChange = (event) => {
    const selectedOptions = Array.from(event.target.selectedOptions).map(
      (option) => option.value
    );
    setModel({ ...model, location_type: selectedOptions });
  };

  const handleInputChange = (e) => {
    setModel({ ...model, [e.target.name]: e.target.value });
  };

  const handleFileUpload = (e) => {
    let files = e.target.files;
    let fileReader = new FileReader();
    fileReader.readAsDataURL(files[0]);
    fileReader.onload = (event) => {
      setFile(event.target.result);
      setModel({ ...model, picture_url: event.target.result });
    };
  };

  const handleMultiFileUpload = (e) => {
    let files = e.target.files;
    let fileReader = new FileReader();
    const filesArray = Array.from(files);
    const base64Array = [];

    // Define a function to handle reading each file
    const readNextFile = (index) => {
      if (index < filesArray.length) {
        const fileReader = new FileReader();
        fileReader.readAsDataURL(filesArray[index]);

        fileReader.onload = (event) => {
          // Add the base64 result to the array
          base64Array.push(event.target.result);

          // Read the next file
          readNextFile(index + 1);
        };
      } else {
        // All files have been read, join the array into a single string
        const commaSeparatedBase64 = base64Array.join("||");

        // Assuming setModel is a function to update the state
        setModel({ ...model, picture_urls: commaSeparatedBase64 });
      }
    };

    // Start reading the first file
    readNextFile(0);
  };

  const handleModelUpdate = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      model.modelId = id;

      model.selectedAreas_primary = model.selectedAreas_primary.toString();
      model.selectedAreas = model.selectedAreas.toString();
      model.location_type = model.location_type.toString();
      const serviceAll = selectedServices.join(",");
      model.services = serviceAll;
      model.picture_url = file;
      model.servicePrices = JSON.stringify(servPri);
      console.log("model final", model);
      const response = await axios.post(
        "https://tsm.spagram.com/api/update-model.php",
        model
      );
      console.log("model update", response.data);
      setMessage(
        'After you are done here, please go to the "Availability" tab from the left sidebar to set your available time.'
      );
      setLoading(false);

      model.selectedAreas_primary = model.selectedAreas_primary.split(",");
      model.selectedAreas = model.selectedAreas.split(",");
      model.location_type = model.location_type.split(",");
    } catch (error) {
      console.error(error);
    }
  };

  function handleServPri() {}

  const handleServChange = (index, property, value) => {
    //setModel({...servPri, [e.target.name]:  e.target.value})
    // setServPri(servPri.map(sp => {
    //   if(sp.id === index){
    //     return{...sp, price: e.target.value};
    //   }else{
    //     return sp;
    //   }
    // }))
    // setServPri({...servPri, price: e.target.value})

    //   const values = [...servPri];
    // values[index] = {...values[index], price: e.target.value}
    // setServPri(values);

    const values = [...servPri];
    values[index][property] = value;
    setServPri(values);
  };

  // function showPrices(sp){
  //   return(
  //     sp && sp.map((sps) => (
  //         <ul><li> {sps.name} </li> <li> $ <input type="text" onChange={handleServChange} value={sps.Price}></input> </li></ul>
  //       ))

  //   )

  // }

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const source = params.get("source");
    console.log("from", source);
    source
      ? setInitialMSg(
          "Thanks for the Registration. Please finish your profile settings."
        )
      : "";

    const modelid = localStorage.getItem("token");
    setId(modelid);
    let url = "https://tsm.spagram.com/api/single-model.php?id=" + modelid;

    const getData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(url);
        const result = response.data;

        // setModel({...model, phone: '89999'})

        let areaArr_primary = result.service_area_primary.split(",");
        let areaArr = result.service_area.split(",");
        let locationTypeArr = result.location_type.split(",");
        let servicesArr = result.services.split(",");
        setSelectedServices(servicesArr);
        setModel({
          slug: result.slug,
          name: result.name,
          phone: result.phone,
          email: result.email,
          gender: result.gender,
          selectedAreas_primary: areaArr_primary,
          selectedAreas: areaArr,
          location_type: locationTypeArr,
          incall_location: result.incall_location,
          price: result.price,
          ethnicity: result.ethnicity,
          age: result.age,
          height: result.height,
          color: result.color,
          about: result.about,
          service_area_primary: result.service_area_primary,
          service_area: result.service_area,
          servicePrices: result.services_prices,
          picture_url: result.picture_url,
          picture_urls: result.picture_urls,
          status: result.status,
        });

        setServPri(result.services_prices);

        setLoading(false);
        console.log("retrieved model", model);
        setError(null);
      } catch (err) {
        setError(err.message);
        // setData(null);
      } finally {
        setLoading(false);
      }
    };

    getData();
  }, []);

  return (
    <Layout profile>
      <Head>
        <title>{siteTitle}</title>
      </Head>
      <h5> Profile Status: {model.status} </h5>
      <h2> {initialMSg} </h2>
      <h2> Personal info </h2>
      <section className={modelCss.profileEdit}>
        {!loading ? (
          <form onSubmit={handleModelUpdate} className={modelCss.form}>
            {/* Profile URL */}
            <div className={modelCss.formGroup}>
              <label>Profile URL</label>
              <input
                type="text"
                className={modelCss.input}
                onChange={handleInputChange}
                name="slug"
                value={model.slug}
              />
            </div>

            {/* Name */}
            <div className={modelCss.formGroup}>
              <label>Name</label>
              <input
                type="text"
                onChange={handleInputChange}
                name="name"
                value={model.name}
                className={modelCss.input}
              />
            </div>

            {/* Phone */}
            <div className={modelCss.formGroup}>
              <label>
                Phone
                <span className={modelCss.helpText}>
                  (Don’t add country code, no whitespace)
                </span>
              </label>
              <input
                type="text"
                onChange={handleInputChange}
                name="phone"
                value={model.phone}
                className={modelCss.input}
              />
            </div>

            {/* Email */}
            <div>
              <label>Email</label>
              <input
                type="text"
                onChange={handleInputChange}
                name="email"
                value={model.email}
              />
            </div>

            {/* Gender */}
            <div>
              <label>Gender</label>
              <select
                name="gender"
                value={model.gender}
                className={modelCss.select}
                onChange={handleInputChange}
              >
                <option value="">Select</option>
                <option value="Female">Female</option>
                <option value="Male">Male</option>
                <option value="Trans">Trans</option>
              </select>
            </div>

            {/* Services */}
            <div className={modelCss.servicesBack}>
              <label>Services</label>
              {Services.map((service) => (
                <li key={service.id}>
                  <input
                    type="checkbox"
                    id={service.id}
                    name={service.name}
                    checked={selectedServices.includes(service.name)}
                    onChange={handleServiceChange}
                  />
                  <label htmlFor={service.id}>{service.name}</label>
                </li>
              ))}
            </div>

            {/* Primary Location */}
            <div className={modelCss.primary_area}>
              <label>
                <strong>Primary location</strong> (Select only one location)
              </label>
              <select
                name="primary_area"
                multiple
                value={model.selectedAreas_primary}
                className={modelCss.select}
                onChange={handleAreaChangePrimary}
                style={{ width: "100%", height: "300px" }}
              >
                {areas.map((group) => (
                  <optgroup key={group.label} label={group.label}>
                    {group.options.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>

            {/* Secondary Location */}
            <div className={modelCss.primary_area}>
              <label>
                <strong>Secondary location</strong> <br />
                (press and hold ctrl/command to select multiple locations, Press
                and hold 'Shift' to select a range)
              </label>
              <select
                name="area"
                multiple
                value={model.selectedAreas}
                onChange={handleAreaChange}
                className={modelCss.select}
                style={{ width: "100%", height: "300px" }}
              >
                {areas.map((group) => (
                  <optgroup key={group.label} label={group.label}>
                    {group.options.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>

            {/* Call Type */}
            <div className={modelCss.lebeltop}>
              <label>Call Type (hold ctrl to select both)</label>
              <select
                name="location_type"
                multiple
                value={model.location_type}
                className={modelCss.select}
                onChange={handleLocationTypeChange}
              >
                <option value="">Select</option>
                <option value="inCall">inCall</option>
                <option value="outCall">outCall</option>
              </select>
            </div>

            {/* inCall Location */}
            <div>
              <label>inCall Location</label>
              <input
                type="text"
                onChange={handleInputChange}
                name="incall_location"
                value={model.incall_location}
              />
            </div>

            {/* Rate */}
            <div>
              <label>Rate per hour($)</label>
              <input
                type="text"
                onChange={handleInputChange}
                name="price"
                value={model.price}
              />
            </div>

            {/* Ethnicity */}
            <div>
              <label>Ethnicity</label>
              <select
                name="ethnicity"
                value={model.ethnicity}
                className={modelCss.select}
                onChange={handleInputChange}
              >
                <option value="">Select</option>
                {Ethnicities.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            {/* Age */}
            <div>
              <label>Age</label>
              <input
                type="text"
                onChange={handleInputChange}
                name="age"
                value={model.age}
              />
            </div>

            {/* Height */}
            <div>
              <label>Height (in feet, ie 5.7)</label>
              <input
                type="text"
                onChange={handleInputChange}
                name="height"
                value={model.height}
              />
            </div>

            {/* Color */}
            <div>
              <label>Color</label>
              <select
                name="color"
                value={model.color}
                className={modelCss.select}
                onChange={handleInputChange}
              >
                <option value="">Select</option>
                <option value="White">White</option>
                <option value="Black">Black</option>
              </select>
            </div>
            {/* /*
            {model.servicePrices.split(",").map((spString) => (
              <ServicePricesUI {...spString} />
            ))}
            */
            /* {console.log("sd", typeof servp)} */
            /* {showPrices(servPri)}
             */}

            {/* About */}
            <div className={modelCss.lebeltop}>
              <label>About</label>
              <textarea
                onChange={handleInputChange}
                className={modelCss.textarea}
                rows="4"
                cols="50"
                name="about"
                value={model.about}
              ></textarea>
            </div>

            {/* Profile Picture */}
            <div className={modelCss.formGroup}>
              <label>Profile Picture</label>
              <div className={modelCss.imageUpload}>
                <img src={model.picture_url} alt="Profile" />
                <input
                  type="file"
                  id="picture_url"
                  onChange={handleFileUpload}
                  name="picture_url"
                  accept="image/*"
                />
              </div>
            </div>

            {/* Submit */}
            <div className={modelCss.submitBox}>
              <button className={modelCss.submitBtn} type="submit">
                Update Profile
              </button>
              {loading && (
                <img width="30px" src="images/loading.gif" alt="loading" />
              )}
            </div>
            <p className={modelCss.message}>{message}</p>
          </form>
        ) : (
          <h2>Updating…</h2>
        )}
      </section>
    </Layout>
  );
};

export default withAuth(Profile);
