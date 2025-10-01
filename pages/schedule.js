import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import utilStyles from  '../styles/utils.module.css';
import Layout, { siteTitle } from '../components/layout';
import Link from 'next/link';
import { useRouter } from 'next/router';
// import Router from 'next/router';
import axios from 'axios';
import SingleModelView from '../components/singleModelView';
import Loading from '../components/Loading';
import SquareForm from '../components/squareform';
import ModelReview from '../components/modelReview';



//  <SquareForm /> 




function Booking() {

    const [formData, setFormData] = useState({name: '', email: '', phone: '', address: '', city: '', zip: '', password: '', selected_model: ''});  
    const [orderData, setOrderData] = useState({customer_id: '', model_id: '', service_address: '', service_type: '', service_time: '', amount_received: '', cardid:'', status:''});  

    
    const [isTimeSelected, setIsTimeSelected] = useState(false);
    const [isDateSelected, setIsDateSelected] = useState(false);
    const [succMessage, setSuccMessage] = useState(null);
    const [modelID, setModelID] = useState(null);
    const [singleModel, setSingleModel] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [message, setMessage] = useState(null);
    const [loginmessage, setLoginmessage] = useState("");
    const [loginform, setLoginform] = useState(true);
    const [modelAvailTime, setModelAvailTime] = useState(null);
    const [showCardForm, setShowCardForm] = useState(false);
    const [incall, setIncall] = useState(true);
    const [selectedCallType, setSelectedCallType] = useState();
    const [inCallSelected, setInCallSelected] = useState(false);
    const [outCallSelected, setOutCallSelected] = useState(false);
    const [outCallLocation, setOutCallLocation] = useState(false);
    const [showSaveCard, setShowSaveCard] = useState(false);
    const [showSuccessPage, setShowSuccessPage] = useState(false);
    
    
    
    const [dayhours, setDayhours] = useState(['9 am', '10 am', '11 am', '12 pm', '1 pm', '2 pm', '3 pm', '4 pm', '5 pm', '6 pm', '7 pm', '8 pm', '9 pm', '10 pm',
      '11 pm', '12 am', '1 am', '2 am', '3 am', '4 am', '5 am', '6 am', '7 am', '8 am']);
    

    const [loginformData, setLoginformData] = useState({
      email: '',
      password: '',
    });

    const reviewGen = () => {
      const possibleValues = [3.5, 4, 4.5, 5];
      const randomIndex = Math.floor(Math.random() * possibleValues.length);
      return possibleValues[randomIndex];
      
    }
  
    const handleLoginFieldChange = (e) => {
      setFormData({
        ...formData,
        [e.target.name]: e.target.value
      });
    };


    const callDefaultFunctions = () => {
      const loc_type = singleModel[0].location_type;
      const locArr = loc_type.split(',');
      if(locArr.length < 2){
        calltypeSelector(locArr[0]);
      }
    }


    // const showSingleModelAndinCall = () => {
    //    calltypeSelector("inCall");
    //   return(
    //     <SingleModelView  {...singleModel}  />
    //   )
    // }

    const getcardEndingwith = () => {
      // let customerId = localStorage.getItem('customerid');
      // try {
      //   const response = await axios.get('https://tsm.spagram.com/api/cardendwith.php?customerid=' + customerId);
      //   console.log('caardindwith', response.data);
      //   // if(response.data.success == '1') {
              
      //   //   cardending = response.data.cardend;
      //   //       // window.location.href = location.state ? location.state.from.pathname : '/';
      //   // }
  
    
      // } catch (error) {
      //   console.error(error);
      // }
      
      return ' ';
    };

    const router = useRouter();
    const {singleApiUrl} = router.query;
    const urlParams = new URLSearchParams(singleApiUrl);
    let tdate = urlParams.get('date');

    // const modId = singleApiUrl.split("=")[1];
    // console.log('urs', modelID);

    // const queryString = window.location.href;
    // console.log(queryString);
    // const urlParams = new URLSearchParams(queryString);
    // const product = urlParams.get('id')
    //   console.log('modiel id', id);

    const calltypeSelector = (e) => {
      console.log('calltype selector func called');
      let ctype = e.target.value;
      setSelectedCallType(ctype);
      if(ctype == 'inCall'){
        setInCallSelected(true);
        setOutCallSelected(false);
        const saddress = singleModel[0].incall_location;
        setOrderData({...orderData, service_address: saddress, service_type: 'inCall' });

      }else{
        setOutCallSelected(true);
        setInCallSelected(false);
      }
    }

    const handleOutcallLocation = (e) => {
      setOutCallLocation(e.target.value);
      setOrderData({...orderData, service_address: e.target.value, service_type: 'outCall' });
    }

    // this is button version, but got a problem showing address without clicking the incall button when inCall is the only option
    // const location_selector = () => {
    //   const loc_type = singleModel[0].location_type;
    //   const locArr = loc_type.split(',');
    //   return(
    //     <div className='calltypeCnt'>
    //         <div className='calltypes'> <span> inCall/outCall :  </span> { locArr.length < 2 ? <button onClick={()=> calltypeSelector(locArr[0]) } className={inCallSelected?'selected': ''}> {locArr[0]} </button> : <div> <button onClick={()=> calltypeSelector(locArr[0]) } className={inCallSelected?'selected': ''}> {locArr[0]} </button> <button onClick={()=> calltypeSelector(locArr[1]) } className={outCallSelected?'selected': ''}> {locArr[1]} </button> </div> }  </div> 
    //       <div> { selectedCallType ?  selectedCallType == "inCall"? ' Incall Location: ' + singleModel[0].incall_location  : <div> <input type='text' onChange={handleOutcallLocation} placeholder='Enter Outcall Location' name='outcall_location' /> </div> : '' } </div>
    //       <div>  </div>
    //     </div>
    //   )
    // }


    const location_selector = () => {
      const loc_type = singleModel[0].location_type;
      const locArr = loc_type.split(',');
      return(
        <div className='calltypeCnt'>
            <div className='calltypes'> { locArr.length < 2 ? <select onChange={calltypeSelector}><option>inCall/outCall</option><option>{locArr[0]}</option></select> : <select onChange={calltypeSelector}><option>inCall/outCall</option><option>{locArr[0]}</option><option>{locArr[1]}</option></select> }  </div> 
          <div> { selectedCallType ?  selectedCallType == "inCall"? ' Incall Location: ' + singleModel[0].incall_location  : <div> <input type='text' onChange={handleOutcallLocation} placeholder='Enter Outcall Location' name='outcall_location' /> </div> : '' } </div>
          <div>  </div>
        </div>
      )
    }
   
    const handleChange = (e) => {
      setFormData({
        ...formData,
        [e.target.name]: e.target.value
      });
    };

    const get10percent = (price) => {
      let priceinF = parseFloat(price);
      let tenp = (10 / 100) * priceinF;
      return tenp.toFixed(2);
      // return priceinF;
    }


    const confirmorder = async (e) => {
      e.preventDefault();
      try {
        console.log('incall location', singleModel[0].incall_location, inCallSelected);
        const saddress = singleModel[0].incall_location;
        //Status: 
        // Initiated
        // CardFailed 
        // Paid
        // Approved 
        // Denied
        // Refunded 
        // Done 

       
        console.log('orderdata before confirmorder ', orderData);
        const response = await axios.post('https://tsm.spagram.com/api/confirmorder.php', orderData);
        console.log('order retured', response.data);
        if(response.data.success == '1') {
              const { token } = response.data;
              
              // setSuccMessage('Order confirmed! Please check your email for details');
             localStorage.setItem("customertoken", token);
             window.location.href = "/cardsaved";
              
              // window.location.href = location.state ? location.state.from.pathname : '/';
        }
  
    
      } catch (error) {
        console.error(error);
      }
    };


    const cardForm = () => {
      return(
        <div className='registration-container'>
          <h3> Enter your card details </h3>
          <p> We will save your card in a Square secure server and charge you after the therapist accept your request </p>
          <SquareForm customer_id={orderData.customer_id} model_id={orderData.model_id} service_address={orderData.service_address} service_type={orderData.service_type} service_time={orderData.service_time}  price={orderData.amount_received}  showSuccessPage={showSuccessPage} />
        </div>
      );
      
    };

    const handleLogin = async (e) => {
      e.preventDefault();
      try {
        const response = await axios.post('https://tsm.spagram.com/api/login-customer.php', formData);
        console.log('rest', response.data);
        if(response.data.success == '1') {
              const { token } = response.data;
              console.log('retured after login', response.data)
              localStorage.setItem("customertoken", token);
              setIsLoggedIn(true);
              setOrderData({
                ...orderData,
                customer_id: token
              });
      
              // window.location.href = location.state ? location.state.from.pathname : '/';
        }else{
          setLoginmessage("Email/Password is not correct. Please try again or click to the button below to register. ");
        }
  
    
      } catch (error) {
        console.error(error);
      }
    };
    

    const handleCustomerRegistration = async (e) => {
      e.preventDefault();
      setLoading(true);
      setSuccMessage("");
      try {
        formData.selected_model = modelID;

        const response = await axios.post('https://tsm.spagram.com/api/register-customer.php', formData);
        console.log('client data', formData);
        console.log('rest', response.data);
        if(response.data.success == '1') {
              const { customerdbid, cardsaved } = response.data;
              localStorage.setItem("customerdbid", customerdbid);
              localStorage.setItem("cardsaved", cardsaved);
              localStorage.setItem("price", orderData.amount_received);

              setOrderData({...orderData, customer_id: customerdbid });
              
              setSuccMessage("Your registration is successful");
              setShowSaveCard(true);
              setFormData({name: '', email: '', phone: '', address: '', city: '', zip: '', password: ''});
              // router.push("http://localhost:3005/customer-success");
              // window.location.href = location.state ? location.state.from.pathname : '/';
              console.log('insertedcustomer id', customerdbid);
              setLoading(false);
        }else{
          setLoading(false);
          setSuccMessage("Error! Please contact support.");
        }
    
    
      } catch (error) {
        console.error(error);
      }
    };

  const userLogin = () => {
    
     const token = localStorage.getItem("customertoken");
     console.log('h', token);
      if (token) {
        setIsLoggedIn(true);
        setOrderData({
          ...orderData,
          customer_id: token
        });

      }
  }

  // const today = new Date();

  const goNextDay = (dstring) => {
    // console.log('current date:', currentdate);

    // if(currentdate != ''){
    //   dstring = currentdate
    //   window.currentdate = '';
    // }

   const tomorrow = new Date(dstring);
    tomorrow.setDate(tomorrow.getDate() + 1);

    let day = tomorrow.getDate();
    let month = tomorrow.getMonth() + 1;
    let year = tomorrow.getFullYear();
    let nextday = month + '/' + day + '/' + year;
    setIsDateSelected(nextday);
    console.log('Tomorrow:', nextday);
    updateAvailTime(modelID, nextday)

  }

  const getTodayDate = () =>{
    const today = new Date();
    
    let day = today.getDate();
    let month = today.getMonth() + 1;
    let year = today.getFullYear();
    let todayFormated = month + '/' + day + '/' + year;
    // console.log('insidetoday', day, month, year);
    setIsDateSelected(todayFormated);
    return todayFormated;
  }

  const goPrevDay = (dstring) => {
    
    const tomorrow = new Date(dstring);
     tomorrow.setDate(tomorrow.getDate() - 1);
 
     let day = tomorrow.getDate();
     let month = tomorrow.getMonth() + 1;
     let year = tomorrow.getFullYear();
     let prevday = month + '/' + day + '/' + year;
     setIsDateSelected(prevday);
     console.log('Tomorrow:',prevday);
     updateAvailTime(modelID, prevday)
   }

   const updateAvailTime = async (modId, cdate) => {
    // console.log('availtime udpated', modId, isDateSelected);
    try {
      let cdated = ''
      if(cdate == ''){
          const urlParams = new URLSearchParams(singleApiUrl);
           cdated = urlParams.get('date')
          setIsDateSelected(cdated);
         // setIsDateSelected('4/8/2023');
         setIsDateSelected(urlParams.get('time'));
      }else{
        cdated = cdate;
        setIsDateSelected(cdate);
      }

      console.log('cdate', cdated);
      

      const response = await axios.get('https://tsm.spagram.com/api/availability.php?modelid='+ modId + '&date=' + cdated);

      console.log('availdata','https://tsm.spagram.com/api/availability.php?modelid='+ modId + '&date=' + cdated, response.data);
      setModelAvailTime(response.data);
      if(response.data.success == '1') {
            const { token } = response.data;
            // localStorage.setItem("customertoken", token);
            
            // window.location.href = location.state ? location.state.from.pathname : '/';
      }
  
    } catch (error) {
      console.error(error);
    }
    // modelAvailTime
   }

   const isHourAvailable = (hour) => {

    return ' hello="hi" ';

   }

   const xhours = [];

  dayhours.map((hour) => { 
    let xx = ""
    if (modelAvailTime && modelAvailTime.includes(hour)){
      xhours.push(
        <div onClick={()=> selectTime(hour)} className='available' > {hour} </div>
      );
    }else{
      xhours.push(
        <div className='notavailable' > {hour} </div>
      );
     
      
    }
  })

  const selectTime = (hour) => {
    setIsTimeSelected(hour)
    const amount = get10percent(singleModel[0].price);
    let selected_date = '';
    if(isDateSelected != ''){
      selected_date = isDateSelected;
    }else{
      selected_date = getTodayDate();
    }
    console.log('todays date',  getTodayDate());
    setOrderData({...orderData, service_time: selected_date + ', ' + hour, amount_received: amount, cardid: '', status: 'Initiated'});
    
  }

  const registraionForm = () => {
    return(
      <div className='registration-container'>
        <h2> Fill the form </h2>
        <form onSubmit={handleCustomerRegistration}>
          <label for="name">Name:</label>
          <input type="text" id="name" onChange={handleChange} name="name" value={formData.name}/>

          <label for="email">Email:</label>
          <input type="email" id="email" onChange={handleChange} name="email" value={formData.email}/>

          <label for="phone">Phone: (Don't add country code +1, don't add white space ) </label>
          <input type="tel" id="phone" onChange={handleChange} name="phone" value={formData.phone}/>

          <label for="address">Address:</label>
          <textarea id="address" onChange={handleChange} name="address" value={formData.address}></textarea>
          <label for="city">City:</label>
          <input type="text" id="city" onChange={handleChange} name="city" value={formData.city} />
          <label for="zip">Zip:</label>
          <input type="text" id="zip" onChange={handleChange} name="zip" value={formData.zip} />

          <label for="name">Create Password:</label>
          <input type="password" id="password" onChange={handleChange} name="password"  value={formData.password}  />
          <input type="hidden" id="selected_model" name="selected_model" value={modelID} />
              <button className='button' type="submit">Submit</button>
              {loading && <Loading/>}
              <h2> {succMessage} </h2>  
        </form>
        <div className='button' onClick={()=>setLoginform(true)}> Member? Click to login </div> 
      </div>
    );
  }

  
  useEffect(() => {
    


    userLogin();
    // const { data } = 
    // console.log('data', data);
    // const modelUrl = 'https://tsm.spagram.com/api/models.php' +  '?id=' + data
    const getData = async () => {
        try {
          const response = await axios.get(singleApiUrl);
          setSingleModel(response.data);
          // singleModel && calltypeSelector("inCall");
          // console.log('sdd', response.data[0].location_type);
          // const timeout = setTimeout(() => {
          //    calltypeSelector("inCall");
          // }, 10000)

          const urlParams = new URLSearchParams(singleApiUrl);
          // setIsDateSelected(urlParams.get('date'));
          // setIsDateSelected('4/8/2023');
          // setIsDateSelected(urlParams.get('time'));
          let modId = singleApiUrl.split("=")[1];
          console.log('modid, di', modId);
          modId = modId.split('&')[0];
          console.log('modid, di', modId);
          setModelID( modId );
          setOrderData({
            ...orderData,
            model_id: modId
          });
  
          
          console.log('surl',singleApiUrl)
          console.log('sdata',response.data)
          updateAvailTime(modId, '');

          setError(null);
        } catch (err) {
          setError(err.message);
          setSingleModel(null);
        } finally {
          setLoading(false);
        }
      };

      // let modid = singleApiUrl.split("=")[1];

      console.log('date and time', isDateSelected, '---', isTimeSelected);

        getData();
  //       const availabilityUrl = 'https://tsm.spagram.com/api/availability.php?id=' + singleApiUrl.split("=")[1] + 'date=' + isDateSelected + 'time=' + isTimeSelected;
 
  }, [singleApiUrl]);


 
  return (
    <Layout>
      <Head>
        <title> Book a model </title>
      </Head>
      <div className="bookingpage">
      {/* <SquareForm /> */}
       
            <div className='modelInfoCnt'> 
                <h1>   </h1>


                {loading && <div>Loading...</div>}
                    {error && (
                    <div>{`There is a problem fetching the post data - ${error}`}</div>
                )}

                {/* {singleModel && console.log('smodel', ...singleModel) } */}

                {singleModel && <SingleModelView  {...singleModel}  />  }    
                {/* {singleModel && showSingleModelAndinCall()  }     */}
                {/* { singleModel && callDefaultFunctions() }     */}
                <ModelReview />
            </div>
            { !isTimeSelected? 
              <div className='date-selector'> 
              <h2 className='mktitle'> Make an Appointment with { singleModel && singleModel[0].name} </h2>
              <p className='smallfont'> We will charge you ${ singleModel && get10percent(singleModel[0].price) } (10% of ${singleModel && singleModel[0].price})  </p>
              <p> Select Call type </p>
                { singleModel && location_selector() }
                <div className='date-changer'>
                  <a onClick={()=>goPrevDay(isDateSelected? isDateSelected : tdate)}> Back &nbsp;&nbsp; </a>
                    <strong>  {isDateSelected? isDateSelected : tdate} </strong> 
                  <a onClick={()=>goNextDay(isDateSelected? isDateSelected : tdate)}> &nbsp;&nbsp; Next </a>
                </div>
                <div> Select Green box. if All is booked then click next button above </div>
                <div className='timeCardCnt'>
                    {xhours}
                </div>

                
                
             </div>

              :
              <div className='forms'> 
              <div>
            {!isLoggedIn? 
              <div className='col2 bookarea'>
                {loginform ? 
                      <div className="registration-container">
                          <p className='selected_label'>Selected date: {isDateSelected? isDateSelected: tdate}, Time: {isTimeSelected} <span className='anchor' onClick={()=>setIsTimeSelected(false)}> Change </span>  </p>
                          <form onSubmit={handleLogin}>
                              
                              <div>
                                <h2> Login to Book an Appointment </h2>
                                  <label>Email:</label>
                                  <input type="email" id="email" name="email" onChange={handleLoginFieldChange} required/>
                              </div>
                              <div>
                                  <label>Password:</label>
                                  <input type="password" id="password" name="password" onChange={handleLoginFieldChange}  required/>
                              </div>
                              
                              <button className='button' type="submit">Submit</button>
                              <p className='message'> {message}</p>
                          </form>

                          <p> {loginmessage} </p>

                          <div className='button' onClick={()=>setLoginform(false)}> Not a member? Click to register </div> 
                       </div>
                : 
                   
                  showSaveCard? cardForm() : registraionForm()  
                }
                  
              </div>   
            :
              <div className='order-box'> 
                <div className='order-summary'>
                <p> Selected Date/Time: <strong> {isDateSelected == '' ? getTodayDate() : isDateSelected } | {isTimeSelected} </strong> <span className='anchor' onClick={()=>setIsTimeSelected(false)}> Change </span> </p>
                <p> Price: ${ get10percent(singleModel[0].price) } (10% of ${singleModel[0].price} )  </p>
                </div>

                <p> Use the Saved card {getcardEndingwith()}  </p>
                <a onClick={() => setShowCardForm(true)}> Use a new debit/credit card </a>
                {showCardForm? 
                  <div className='cardform'> 
                    <SquareForm />
                  </div> 
                : '' 
                }
               <br/>
                <a className='button' onClick={confirmorder}> Reserve the Appointment   </a> 
                <p> {succMessage} </p>
              </div>
            }
          </div>

          </div> ///end of forms after date/time selection box
            
          }
            
        </div>

       
    </Layout>
  );
}

export default Booking;