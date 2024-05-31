import React, { useRef, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Context } from "../../store/appContext.jsx"

import { Tooltip as ReactTooltip } from "react-tooltip";

import Constants from "../../app/constants.js"
import NavbarBreadcumb from "./navbarBreadcumb.jsx"
import ProfileDropDown from "./profileDropDown.jsx"

const Navbar = () => {
  const 
    { language, store, actions }= React.useContext(Context),
    [navbarState, setNavbarState] = React.useState(false),
    [profileDropDown, set_profileDropDown] = React.useState(false)
    const nav = useNavigate();
    const dropdownRef = useRef(null);

    const _userDarkMode= actions.getUserPref(Constants.USERPREFS_DARKMODE)


//--- para click fuera de dropDown n shi -------------------------------------------------
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        set_profileDropDown(false);
      }
    };

    useEffect(() => {
      if (profileDropDown) {
        document.addEventListener("mousedown", handleClickOutside);
      } else {
        document.removeEventListener("mousedown", handleClickOutside);
      }
  
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, [profileDropDown]);
  //---------------------------------------------------------------------------------------

  function handleAnchor(obj){
    console.log('navbarbutton touched')
    if(store.activePage == Constants.PAGE.landing) {
      const 
        item= document.querySelector("#" + obj),
        page= document.querySelector("#landing-main")

      if(item && page) {
        const y= item.getBoundingClientRect().top - page.getBoundingClientRect().top
        page.scrollTo({ top: y, left: 0, behavior: "smooth" })
      }
    }
    else nav("/?href=" + obj)
  }

  function toggle_darkModeState(e){ actions.toggleUserPref(Constants.USERPREFS_DARKMODE)}

  return (
    <>
    {store.userData ? 
      <div className="sticky top-0 bg-w dark:bg-dark text-stone-800 dark:text-zinc-400 w-full flex z-50 border-b border-gray-600">
        <div className="flex h-[60px] w-full md:max-w-[1550px] mx-auto items-center justify-between px-8 md:px-4">
          <div className="flex items-center">
            <p onClick={()=>nav('/')} className="cursor-pointer text-2xl f-body font-[600] mr-20 text-dark dark:text-white">KeQQu</p>  
              <NavbarBreadcumb />
          </div>
            <div className="ml-10 flex items-center">
              <div data-tooltip-id="my-tooltip-1"
                className=" w-6 h-6 flex items-center justify-center rounded-full mr-8 f-body border-2 border-white"
              >
                  ?
              </div>
              <button className="w-9 h-9 rounded-full overflow-hidden mr-4" onClick={toggle_darkModeState}>
                {_userDarkMode ? 
                  <i className="fa-regular fa-moon text-xl"></i>
                  :
                  <i className="fa-regular fa-sun text-xl"></i>
                }
              </button>
              <button className="w-9 h-9 rounded-full overflow-hidden" onClick={()=>{set_profileDropDown(!profileDropDown)}}>
                <img className="size-full" src={store.userData.avatar} alt="user avatar" />
              </button>
                {profileDropDown && (
                  <div ref={dropdownRef}>
                    <ProfileDropDown />
                  </div>
                )
                }
            </div>
          <div onClick={()=>{setNavbarState(!navbarState)}} className="black hidden">
          {navbarState ? 
            <i className="fa fa-regular fa-circle-mark" size={18} /> 
            : 
            <i className="fa fa-regular fa-bars" size={18} />} 
          </div>
          <div className={navbarState ? 'fixed left-0 top-0 h-full bg-white w-80 border-l border-r-gray-600 ease-and-out duration-500' : 'fixed top-0 h-full left-[-30rem] ease-and-out duration-700'}>
            <h1 className="mx-4 pt-8  text-3xl/9 font-bold text-black">
              KeQQu
            </h1>
            <ul className="p-4 text-black">
              <li className="border-b border-black p-5">Why KeQQu</li>
              <li className="border-b border-black p-5">How it works</li>
              <li className="border-b border-black p-5">Pricing</li>
              <li className="border-b border-black p-5">FAQ</li>
              <li className="p-5 border-b border-black">Contact</li>
              <li className="border-b border-black p-5">This should only show for mobile devices but for now...</li>
            </ul>
          </div>
        </div>
      </div> 

    : 

    <div className="sticky top-0 bg-w w-full flex z-50 border-b-[1px] border-gray-600  dark:bg-dark dark:text-zinc-400">
      <div className="flex h-[60px] w-full md:max-w-[1550px] mx-auto items-center justify-between px-8 md:px-4">

          <p onClick={()=>{nav("/")}}className=" text-2xl f-body font-[600] mr-24  text-b dark:text-w">KeQQu</p>  

          <ul className="md:flex max-h-[60px] w-max-1/2 whitespace-nowrap hidden space-x-8">
            <li onClick={()=>{handleAnchor("whykeqqu")}} className="m-5 mx-auto f-tittle cursor-pointer text-b dark:text-w">Why KeQQu</li>
            <li onClick={()=>{handleAnchor("howitworks")}} className="m-5 mx-auto f-tittle cursor-pointer text-b dark:text-w">How it works</li>
            <li onClick={()=>{handleAnchor("pricing")}} className="m-5 mx-auto f-tittle cursor-pointer text-b dark:text-w">Pricing</li>
            <li onClick={()=>{handleAnchor("faq")}} className="m-5 mx-auto f-tittle cursor-pointer text-b dark:text-w">FAQ</li>
            <li onClick={() => nav("/contact")} className="m-5 mx-auto f-tittle cursor-pointer text-b dark:text-w">Contact</li>
          </ul>
          <div className="ml-10">
              <button className="w-9 h-9 rounded-full overflow-hidden mr-4" onClick={toggle_darkModeState}>
                {_userDarkMode ? 
                  <i className="fa-regular fa-moon text-xl"></i>
                  :
                  <i className="fa-regular fa-sun text-xl"></i>
                }
              </button>
            <button onClick={()=>{nav("/signup")}} className="f-body border border-black dark:border-w hover:bg-black rounded-[30px] px-7 py-1 text-b dark:bg-w dark:text-black dark:hover:bg-transparent hover:text-white transition duration-300 ease-in-out">Register</button>
            <button onClick={()=>{nav("/login")}} className="f-body hover:bg-b hover:text-w border-black border-[1px] dark:border-w rounded-[30px] ml-10 px-7 py-1 text-b dark:text-w dark:hover:bg-white dark:hover:text-black transition duration-300 ease-in-out">Login</button>
          </div>

        { navbarState &&
        <>
        <div onClick={handleNav} className="black hidden">
          {navbarState ? <i className="fa fa-regular fa-close" /> : <i className="fa fa-solid fa-bars" />} 
        </div>
        <div className={nav ? 'fixed left-0 top-0 h-full bg-white w-80 border-l border-r-gray-600 ease-and-out duration-500' : 'fixed top-0 h-full left-[-30rem] ease-and-out duration-700'}>
          <h1 className="mx-4 pt-8  text-3xl/9 font-bold text-black">
            KeQQu
          </h1>
          <ul className="p-4 text-black">
            <li className="border-b border-black p-5">Why KeQQu</li>
            <li className="border-b border-black p-5">How it works</li>
            <li className="border-b border-black p-5">Pricing</li>
            <li className="border-b border-black p-5">FAQ</li>
            <li className="p-5 border-b border-black">Contact</li>
            <li className="border-b border-black p-5">This should only show for mobile devices but for now...</li>
            <li className="border-b border-black p-5">This should only show for mobile devices
            but for now...</li>
          </ul>
        </div>
        </>
        
        }
      </div>
    </div>
    }


    <ReactTooltip
      className="w-16 "
      id="my-tooltip-1"
      place="bottom"
      content={<p>Don't know how to use Keqqu?<br></br>Don't worry, soon you will have tutorial videos! </p>}
    />
    
    </>
  )
}

export default Navbar
