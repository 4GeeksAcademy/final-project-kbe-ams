import React, { useState } from "react"

const Accordion = ({question, answer}) => {
  const [accordionOpen, setAccordionOpen] = useState(false)

  return (
    <div onClick={() => setAccordionOpen(!accordionOpen)} className="bg-accent-l dark:bg-primary-n px-10 py-5 rounded-[3rem] my-8">
      <div className="py-2">
        <div className="flex w-full h-full justify-between items-center">
          <p className="f-tittle dark:text-w flex">{question}</p>
          {!accordionOpen ? 
            <span className="dark:text-yellow-400 text-3xl transition duration-700 ease-in-out">
              <i className="fa fa-regular fa-circle-plus"/>
            </span> 
            : 
            <span className="dark:text-yellow-400 text-3xl transition duration-500 ease-in-out">
              <i className="fa fa-regular fa-circle-minus"/>
            </span>
          }
        </div>
        <div
          className={`grid overflow-hidden transition-all duration-300 ease-in-out ${
            accordionOpen
              ? "grid-rows-[1fr] opacity-100 py-2"
              : "grid-rows-[0fr] opacity-0"
          }`}
        >
          <div className="overflow-hidden dark:text-w mr-10 f-body-sm">{answer}</div>
        </div>
      </div>
    </div>
  )
}

export default Accordion;
