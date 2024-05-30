import React from "react"
import { useNavigate } from "react-router-dom";
import Accordion from "../component/Accordion.jsx";
import { Context } from "../store/appContext.jsx";
import Constants from "../app/constants.js";

//--- icons ------------------------------------
import bricks from "../../assets/img/home-view-images/bricks.png"
import vieja from "../../assets/img/image.png"

const LandingView = () => {
  const
    { store, actions }= React.useContext(Context),
    nav= useNavigate()
    
  React.useEffect(()=>{
    setTimeout(()=>{
      const 
        urlParams = new URLSearchParams(window.location.search),
        href= urlParams.get('href')

      if(href && href != "") {
    
        const 
          item= document.querySelector("#" + href),
          page= document.querySelector("#landing-main")
          
        if(item && page) {
          const y= item.getBoundingClientRect().top
          page.scrollTo({ top: y, left: 0, behavior: "smooth" })
        }
      }
    }, 125)
  },[])

	return (
    <div className="flex bg-dark overflow-hidden">
      <div id="landing-main" className="w-full overflow-x-hidden overflow-y-auto px-28">
        <div className="flex flex-col pt-[60px] w-full max-w-[1440px] mx-auto">
        {/*--- hero section ------------------------------------ */}
            <div id="heroSection" className="w-full grid grid-cols-2 p-5 items-center">
              <div className="mx-auto my-8">
                <h1 className="f-tittle text-[64px] py-8">Organizing your tasks has never been easier and more convinient</h1>
                <p className="f-body text-xl py-2 w-8/12">Create a workspace and plan your way to go<br/> Your goals are just a few "checks" away from you </p>

                <button onClick={()=>{nav("/login")}} className="border rounded-[10rem] px-10 py-4 f-tittle text-xl bg-accent-l text-black mt-10 hover:bg-transparent hover:text-white transition duration-300 ease-in-out">Get started - its free!</button>
              
              </div>
              <div className="mx-auto bg-b">
                <img src={vieja} alt="" />
                </div>
            </div>
            
        {/*--- trusted by ------------------------------------ */}
            <div id="socialProofSection" className="w-full grid py-20">
              <h2 className="flex justify-center w-full f-tittle text-[48px] my-5">
                Trusted by
              </h2>
                <ul className="grid grid-cols-5 my-10">
                  <li className="mx-auto f-tittle text-4xl">apple</li>
                  <li className="mx-auto f-tittle text-4xl">microsoft</li>
                  <li className="mx-auto f-tittle text-4xl">google</li>
                  <li className="mx-auto f-tittle text-4xl">amazon</li>
                  <li className="mx-auto f-tittle text-4xl">open ai</li>
                </ul>
            </div>

            {/*--- Why KeQQu?  ------------------------------------*/}
            <div id="whykeqqu" className=" w-full py-28">
              <h2 className="flex justify-center py-10 f-tittle text-[48px]">Why KeQQu?</h2>
              <div className="grid min-[960px]:grid-cols-3 h-min py-10 gap-4">
                <div className="bg-primary-d w-full h-full rounded-xl mx-auto p-5 flex flex-col">
                  <i className="fa-solid fa-trowel-bricks text-7xl mx-auto my-[12px]" />
                  <p className="flex justify-center f-tittle text-xl pt-2 text-nowrap">Customize as you want</p>
                  <div className="w-4/6 mx-auto rounded-l-lg h-2 bg-accent-n"></div>
                  <p className="f-body-sm p-5 mt-3 max-lg:text-center">Customize KeQQu to fit your needs, the freedom is in your hands.</p>
                </div>
                <div className="bg-primary-d w-full h-full rounded-xl mx-auto p-5 flex flex-col">
                  <i className="fa fa-icons fa-circle-check text-7xl mx-auto my-[12px]" />
                  <p className="flex justify-center f-tittle text-xl pt-2">Simple to use</p>
                  <div className="w-4/6 mx-auto h-2 bg-accent-n"></div>
                  <p className="f-body-sm p-5 mt-3 max-lg:text-center">Not hard to understand, not hard to start using. Super intuitive and practic.</p>
                </div>
                <div className="bg-primary-d w-full h-full rounded-xl mx-auto p-5 flex flex-col">
                  <i className="fa fa-icons fa-clock text-7xl mx-auto my-[12px]"/>
                  <p className="flex justify-center f-tittle text-xl pt-2">Save a lot of time</p>
                  <div className="w-4/6 mx-auto rounded-r-lg h-2 bg-accent-n"></div>
                  <p className="f-body-sm p-5 mt-3 max-lg:text-center" >Save time and space in your mind. Keeps you organized, no more wasting time.</p>
                </div>
              </div>
            </div>

            {/*--- How does it work? -----------------------------------*/}
            <div id="howitworks" className=" w-full py-28 text-black">
              <div className="bg-accent-l w-full px-20 h-[24rem] rounded-[3rem] mx-auto py-12 flex">
                <div className="w-2/6 pr-10">
                  <h2 className="f-tittle text-[32px]">How Does it Work?</h2>
                  <p className="f-body">Start using KeQQu now in 4 very simple steps</p>
                </div>
                <div className="grid grid-cols-2 w-4/6 pl-32">
                  <div className="flex mb-10">
                    <h4 className="f-tittle text-5xl text-primary-n mr-3">1</h4>
                    <p className="f-body pt-3 mr-5">Create your account.</p>
                  </div>
                  <div className="flex">
                    <h4 className="f-tittle text-5xl text-primary-n mr-3">2</h4>
                    <p className="f-body pt-3">Create your first workspace.</p>
                  </div>
                  <div className="flex">
                    <h4 className="f-tittle text-5xl text-primary-n mr-3">3</h4>
                    <p className="f-body pt-3 mr-5">Add as many lists as you need.</p>
                  </div>
                  <div className="flex">
                    <h4 className="f-tittle text-5xl text-primary-n mr-3">4</h4>
                    <p className="f-body pt-3">Add your tasks, and, you are good to go! </p>
                  </div>
                </div>
              </div>
            </div>

            {/*--- Plans & Pricing ------------------------------------*/}
            <div id="pricing" className="w-full py-28">
              <h2 className="flex justify-center py-10 f-tittle text-[48px] ">Plans & Pricing</h2>
              <div className="grid lg:grid-cols-3 py-10 gap-4">
                <div className="bg-primary-d size-full rounded-xl mx-auto px-10 pt-10 pb-16 flex flex-col">
                  <h4 className="f-tittle text-4xl flex justify-center">BASIC</h4>
                  <div className="w-full h-1 bg-accent-n mb-10 rounded-l-xl"></div>
                  <div className="w-4/5 mx-auto">
                    <div className="flex items-center w-full">
                      <i className="fa fa-solid fa-check text-4xl mr-4"/>
                      <p className="f-body justify-item-end">Unlimited workspaces</p>
                    </div>
                    <div className="flex items-center w-full ">
                      <i className="fa fa-solid fa-check text-4xl mr-4"/>
                      <p className="f-body justify-item-end">Unlimited lists</p>
                    </div>
                  </div>
                  <div id="bottom" className="mt-auto mx-auto"> 
                    <p className="f-tittle flex justify-center text-2xl pb-3">0.00€</p>
                    <button onClick={()=>{nav("/signup")}} className=" f-body border rounded-[30px] px-8 py-3 bg-accent-l text-black hover:bg-transparent hover:text-white transition duration-300 ease-in-out">Get started</button>
                  </div>
                </div>

                <div className="bg-primary-d size-full rounded-xl mx-auto px-10 pt-10 pb-16 flex flex-col">
                  <h4 className="f-tittle text-4xl flex justify-center">PRO</h4>
                  <div className="w-full h-1 bg-accent-n mb-10"></div>
                  <div className="w-4/5 mx-auto">
                    <div className="flex items-center">
                      <i className="fa fa-solid fa-check text-4xl mr-4"/>
                      <p className="f-body justify-item-end">Unlimited workspaces</p>
                    </div>
                    <div className="flex items-center">
                      <i className="fa fa-solid fa-check text-4xl mr-4"/>
                      <p className="f-body justify-item-end">Unlimited lists</p>
                    </div>
                    <div className="flex items-center">
                      <i className="fa fa-solid fa-check text-4xl mr-4"/>
                      <p className="f-body justify-item-end">Unlimited groups</p>
                    </div>
                    <div className="flex items-center">
                      <i className="fa fa-solid fa-check text-4xl mr-4"/>
                      <p className="f-body justify-item-end">Unlimited productivity</p>
                    </div>
                  </div>
                  <div id="bottom" className="mt-auto mx-auto"> 
                    <p className="f-tittle flex justify-center text-2xl pb-3">0.00€</p>
                    <button onClick={()=>{nav("/signup")}} className=" f-body border border-accent-l rounded-[30px] px-8 py-3 text-accent-l hover:bg-white hover:text-black transition duration-300 ease-in-out">Get started</button>
                  </div>
                </div>

                <div className="bg-primary-d size-full rounded-xl mx-auto px-10 pt-10 pb-16 flex flex-col">
                  <h4 className="f-tittle text-4xl flex justify-center">ENTERPRISE</h4>
                  <div className="w-full h-1 bg-accent-n mb-10 rounded-r-xl"></div>
                  <div className="w-4/5 mx-auto">
                    <div className="flex items-center">
                      <i className="fa fa-solid fa-check text-4xl mr-4"/>
                      <p className="f-body justify-item-end">Same features</p>
                    </div>
                    <div className="flex items-center">
                      <i className="fa fa-solid fa-check text-4xl mr-4 text-accent-n"/>
                      <p className="f-body justify-item-end">Same but in yellow</p>
                    </div>
                    <div className="flex items-center">
                      <i className="fa fa-solid fa-check text-4xl mr-4 "/>
                      <p className="f-body justify-item-end">100% free</p>
                    </div>
                  </div>
                  <div id="bottom" className="mt-auto mx-auto"> 
                    <p className="f-tittle flex justify-center text-2xl pb-3">0.00€</p>
                    <button onClick={()=>{nav("/signup")}} className=" f-body border rounded-[30px] px-8 py-3 bg-accent-l text-black hover:bg-transparent hover:text-white transition duration-300 ease-in-out">Get started</button>
                  </div> 
                </div>
              </div>
            </div>

              {/*--- FAQ -----------------------------------*/}
            <div id="faq" className="w-full py-28 text-black">
              <div className="bg-accent-l w-full px-20 rounded-[3rem] mx-auto py-4 flex max-lg:flex-col">
                <div className="w-full lg:w-2/5 py-14 max-lg:mx-auto max-lg:text-center">
                  <h2 className="f-tittle text-[48px]">FAQ</h2>
                  <p className="f-body my-2">Answers to some questions you may have</p>
                </div>
                <div className="w-full lg:w-3/5 lg:p-10">
                  <Accordion question='Is it free?' answer='Yes, this software is 100% free.'/>
                  <Accordion question='Do i have to sign up to use it?' answer='Yes, for being able to use this tool, you will need to sign up and then log in with your account'/>
                  <Accordion question='How do i start using Keqqu?' answer='I suggest you to read the "How does it work" section. You will se it if you scroll up'/>
                  <Accordion question='Is there a premium version of Keqqu?' answer='Currently, Keqqu is completely free and we have no immediate plans for a premium version. We want to ensure that everyone can access our basic features at no cost.'/>
                </div>
              </div>
            </div>

            {/*--- Footer ----------------------------------------------------*/}
            <div id="footer" className="bg-dark w-full py-28 text-black">
              <div className="bg-primary-d w-[1360px] px-10 rounded-[3rem] mx-auto py-4 text-white">
                <div className="w-4/5 m-10 mx-auto flex justify-around">
                  <h3 className="f-tittle text-[32px]">KeQQu</h3>
                  <ul className="flex w-2/5 items-center">
                    <li className="f-tittle text-lg mx-auto">About</li>
                    <li className="f-tittle text-lg mx-auto">Contact</li>
                    <li className="f-tittle text-lg mx-auto">Support</li>
                  </ul>
                  <div className="flex items-center pl-10">
                    <div> 
                      <input type="email" placeholder="join our newsletter!" className="border-none outline-none bg-transparent placeholder-[#fff5c2] p-0 mx-2 placeholder:"  />
                    
                      <div className="bg-accent-l h-[1px] w-56"></div>
                    </div>
                    <button className="mx-4 f-body border rounded-[30px] px-5  bg-[#fff5c2] text-black text-2xl  hover:text-white hover:bg-transparent transition duration-500 ease-in-out">⟶</button>
                  </div>
                </div>
                <div className="bg-gray-400 w-5/6 mx-auto h-1"></div>
                <div className="flex w-9/12 mx-auto mt-5 mb-8 px-20 justify-between">
                  <p className="f-body">2024 - Keqqu,Inc.</p>
                  <div className="flex items-center">
                  <i className="fa fa-brands fa-instagram text-2xl mx-2" />
                  <i className="fa fa-brands fa-youtube text-2xl mx-2" />
                  <i className="fa fa-brands fa-discord text-2xl mx-2" />
                  <i className="fa fa-brands fa-tiktok text-2xl mx-2" />
                  <i className="fa fa-brands fa-twitter text-2xl mx-2" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
	)
}

export default LandingView