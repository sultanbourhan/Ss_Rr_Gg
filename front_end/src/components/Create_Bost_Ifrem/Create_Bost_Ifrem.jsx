import React, { useState } from 'react';
import "./Create_Bost_Ifrem.css";
import Menu from '../main_menu/Menu';
import Chat from '../chat/Chat';
import { useNavigate } from 'react-router-dom';
import { useCookies } from 'react-cookie';
import axios from 'axios';

const Create_Bost_Ifrem = () => {
  const Navigate = useNavigate();
  const [cookies] = useCookies(["token"]);
  const [errors, setErrors] = useState({});
  const [url,SetUrl] = useState("");
  const [des,SetDes] = useState("");
  const [dimensions,Setdimensions] = useState("square");
  const Ifrem = ()=>{
    axios.post('http://localhost:8000/api/v2/post/post_6',{
      url,
      des,
      dimensions
    },{
      headers: {
        Authorization: `Bearer ${cookies.token}`,
      },
    }).then((res)=>{
      console.log(res)
      Navigate("/")
    }).catch((err)=>{
      if (err.response?.data?.errors) {
        const formattedErrors = {};
        err.response.data.errors.forEach((error) => {
          formattedErrors[error.path] = error.msg;
          setErrors(formattedErrors);
          console.log(formattedErrors)
        });
      }
    })
  }
  

  return (
    <div className="home">
      <div className="container">
        <Menu />
        <div className="Create_Bost_Ifrem">
          <h2>Create Bost Ifrem</h2>

          <div className="all_form">
            <div className="diverrors">
            {errors[`url`] && (
                        <p className="errors">{errors[`url`]}</p>
                      )}
              <input type="text" placeholder='Enter Your URL' value={url} onChange={(e)=>SetUrl(e.target.value)}/>
            </div>

              <textarea type="text" placeholder='Enter you description.' value={des} onChange={(e)=>SetDes(e.target.value)}>
                
              </textarea>
              <div className='dimensions'>
                <h3>Display method</h3>
                <div className='distance'>
                  <div className={ `linear ${dimensions === "linear" ? "act" : null} `} onClick={()=> Setdimensions("linear")}>
                      <div className='pencil'></div>
                      <p>16/9</p>
                  </div>
                   <div className={`square  ${dimensions === "square" ? "act" : null}` } onClick={()=> Setdimensions("square")}>
                      <div className='pencil'></div>
                      <p>1/1</p>
                  </div>
                  <div className={ `broad  ${dimensions === "broad" ? "act" : null}`} onClick={()=> Setdimensions("broad")}>
                      <div className='pencil'></div>
                      <p>9/16</p>
                  </div>
                </div>
                
              </div>
          </div>
                <button onClick={Ifrem}>Post</button>

        </div>
        <Chat />
      </div>
    </div>
  );
};

export default Create_Bost_Ifrem;
