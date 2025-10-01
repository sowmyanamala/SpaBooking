import React, { useState } from "react";
import Link from "next/link";
import utilStyles from "../styles/utils.module.css";
import ModelReiview from "../components/modelReview";
import ReactSimplyCarousel from "react-simply-carousel";

function SingleModelView(model) {
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  //console.log('sssss', model, model[0].name);
  return (
    <div className="col2">
      <div className="modelSingel">
        <ReactSimplyCarousel
          activeSlideIndex={activeSlideIndex}
          onRequestChange={setActiveSlideIndex}
          itemsToShow={1}
          itemsToScroll={1}
          forwardBtnProps={{
            //here you can also pass className, or any other button element attributes
            style: {
              alignSelf: "center",
              background: "black",
              border: "none",
              borderRadius: "50%",
              color: "white",
              cursor: "pointer",
              fontSize: "20px",
              height: 30,
              lineHeight: 1,
              textAlign: "center",
              width: 30,
            },
            children: <span>{`>`}</span>,
          }}
          backwardBtnProps={{
            //here you can also pass className, or any other button element attributes
            style: {
              alignSelf: "center",
              background: "black",
              border: "none",
              borderRadius: "50%",
              color: "white",
              cursor: "pointer",
              fontSize: "20px",
              height: 30,
              lineHeight: 1,
              textAlign: "center",
              width: 30,
            },
            children: <span>{`<`}</span>,
          }}
          responsiveProps={[
            {
              itemsToShow: 1,
              itemsToScroll: 1,
              minWidth: 768,
            },
          ]}
          speed={400}
          easing="linear"
        >
          {/* here you can also pass any other element attributes. Also, you can use your custom components as slides */}
          <div style={{ width: 300, height: 800 }}>
            <img
              className={utilStyles.modeSingleimg}
              src={model[0].picture_url || "/images/model.jpeg"}
              alt={model[0].name || "Therapist"}
            />
          </div>

          <div style={{ width: 300, height: 800 }}>
            <img
              className={utilStyles.modeSingleimg}
              src={model[0].picture_url || "/images/model.jpeg"}
              alt={model[0].name || "Therapist"}
            />
          </div>
        </ReactSimplyCarousel>
      </div>
      <div className="modelDesc mt0 pt0">
        <p className="mt0">
          Name: <strong> {model[0].name || "Unknown Therapist"} </strong>
        </p>
        <p>
          Service Area:{" "}
          <strong> {model[0].service_area || "Service Area"} </strong>
        </p>
        <p>
          Availability Type: <strong> {model[0].location_type} </strong>
        </p>
        <p>
          Price: <strong> ${model[0].price} </strong>
        </p>
        <p>
          Gender: <strong> {model[0].gender} </strong>
        </p>
        <p>
          Ethnicities: <strong>{model[0].ethnicity}</strong>
        </p>
        <p>
          Height: <strong> {model[0].height} Feet</strong>
        </p>
        <p>
          Age: <strong> {model[0].age} </strong>
        </p>
        <p>Availability this week: </p>
        {model[0].coverage_map.trim().length !== 0 ? (
          <p className="coverage">
            {" "}
            Coverage Area:{" "}
            <Link hresf={model[0].coverage_map} href={model[0].coverage_map}>
              {" "}
              <img src={model[0].coverage_map} alt="Coverage map" />{" "}
            </Link>{" "}
          </p>
        ) : (
          ""
        )}

        {/* <div className='review-container'> Sidebar for Model Review <ModelReiview /> </div> */}
      </div>
    </div>
  );
}

export default SingleModelView;
