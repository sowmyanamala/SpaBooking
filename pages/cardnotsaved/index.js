import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Layout, { siteTitle } from '../../components/layout';


//  <SquareForm /> 




function Booking() {

    const [formData, setFormData] = useState({name: '', email: '', phone: '', address: '', city: '', zip: '', password: '', selected_model: ''});  
    const [orderData, setOrderData] = useState({customer_id: '', model_id: '', service_address: '', service_type: '', service_time: '', amount_received: '', cardid:'', status:''});  


  useEffect(() => {
    


    // userLogin();
    // const { data } = 
    // console.log('data', data);
    // const modelUrl = 'https://tsm.spagram.com/api/models.php' +  '?id=' + data
    const getData = async () => {
        try {
          
        } catch (err) {
         
        } finally {
        }
      };

      // let modid = singleApiUrl.split("=")[1];

        getData();
  //       const availabilityUrl = 'https://tsm.spagram.com/api/availability.php?id=' + singleApiUrl.split("=")[1] + 'date=' + isDateSelected + 'time=' + isTimeSelected;
 
  });


 
  return (
    <Layout>
      <Head>
        <title> Book a therapist </title>
      </Head>
      <div className="">
      {/* <SquareForm /> */}
       
            <div className='success'> 
                <h1> Square couldn't save your card info. </h1>
                <h2> There is something wrong with your card. Please make sure the information is correct and there is enough balance. </h2>
            </div>
            
        </div>

       
    </Layout>
  );
}

export default Booking;