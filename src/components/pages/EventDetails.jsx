import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Tab, Tabs } from "react-bootstrap";
import Map from "./Map";
import EditEvent from "../EditEvent";
import HypeMeter from "./HypeMeter";
import EditImage from "../EditImage";
import { Navigate, useNavigate } from 'react-router-dom'
import "../../EventDetails.css"

const dayjs = require("dayjs");
const utc = require('dayjs/plugin/utc')
const timezone = require("dayjs/plugin/timezone")
dayjs.extend(utc)
dayjs.extend(timezone)

export default function EventDetails({ currentUser, fetchData }) {
  let navigate = useNavigate()
  const { id } = useParams()
  const [details, setDetails] = useState([])
  const [date, setDate] = useState()
  const [host, setHost] = useState()
  const [showMap, setShowMap] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [eventForm, setEventForm] = useState()
  const [showImgForm, setShowImgForm] = useState(false)
  const [formImg, setFormImg] = useState()

  const handleSubmit = async (e) => {
    e.preventDefault()
    await axios.put(
      `${process.env.REACT_APP_SERVER_URL}/api-v1/events/${id}`,
      eventForm
    )
    setShowForm(!showForm)
    refreshEvent()
  }

  function showTheMap() {
    setShowMap(!showMap)
  }

  const handleClick = async () => {
    if (attendeesListId.includes(currentUser.id)) {
      await axios.put(
        `${process.env.REACT_APP_SERVER_URL}/api-v1/events/${id}/${currentUser.id}/unattend`
      )
      refreshEvent()
    } else {
      await axios.put(
        `${process.env.REACT_APP_SERVER_URL}/api-v1/events/${id}/${currentUser.id}/attend`
      )
      refreshEvent()
    }
  }

  const editEventImg = async (e) => {
    e.preventDefault()
    try {
      const fd = new FormData()
      fd.append("image", formImg)
      const response = await axios.put(
        `${process.env.REACT_APP_SERVER_URL}/api-v1/events/${id}/upload`,
        fd
      )
      refreshEvent()
    } catch (err) {
      console.log(err)
    }
  }

  const refreshEvent = async () => {
    const eventDetails = await axios.get(
      `${process.env.REACT_APP_SERVER_URL}/api-v1/events/${id}`
    )
    setDetails(eventDetails.data)
    setEventForm(eventDetails.data)
    setDate(
      dayjs
        .tz(eventDetails.data.date, "America/New_York")
        .format("dddd MMMM D YYYY")
    )
    setHost(eventDetails.data.host.name)
  }

  let attendeesList = null
  let attendeesListId = []

  {
    details.attendees ? (
      (attendeesList = details.attendees.map((attendee, i) => {
        return <p>{attendee.name}</p>
      }))
    ) : (
      <h3>There are no attendees</h3>
    )
  }

  {
    details.attendees ? (
      details.attendees.map((attendee, i) => {
        return attendeesListId.push(attendee._id)
      })
    ) : (
      <h3>There are no attendees</h3>
    )
  }

  const deleteEvent = async () => {
    await axios.delete(
      `${process.env.REACT_APP_SERVER_URL}/api-v1/events/${id}`
    )
    fetchData()
    navigate("/")
  }
  console.log(details.time)
  console.log(parseInt(details.time.split(":")[0]))

    function timeDisplay(e) {
        let hours = parseInt(e.split(":")[0])
        let minutes = parseInt(e.split(":")[1])
        let amPm = hours >= 12 ? "pm" : "am"
        hours = hours % 12 || 12
      return `${hours}: ${minutes} ${amPm}`
    }

  useEffect(refreshEvent, [])

  return (
    <>
      {currentUser && details.host ? (
        showForm ? (
          <EditEvent
            event={details}
            setShowForm={setShowForm}
            showForm={showForm}
            eventForm={eventForm}
            setEventForm={setEventForm}
            handleSubmit={handleSubmit}
          />
        ) : showImgForm ? (
          <EditImage
            handleSubmit={editEventImg}
            setFormImg={setFormImg}
            event={details}
            setShowImgForm={setShowImgForm}
            showImgForm={showImgForm}
          />
        ) : (
          <div id="eventDetails">
            <div id="content">
              <div id="left">
                <div id="eventImage">
                  <img
                    src={
                      details.image
                        ? details.image
                        : "http://via.placeholder.com/1300x400"
                    }
                    alt={`${details.title}`}
                    id="image"
                  />
                  <button
                    id="editImgBtn"
                    onClick={() => {
                      setShowImgForm(!showImgForm)
                    }}
                  >
                    Edit Image
                  </button>
                </div>

                <div id="tabs">
                  <Tabs
                    defaultActiveKey="description"
                    id="tabs"
                    className="right"
                  >
                    <Tab eventKey="description" title="Description">
                      <p>Hosted By: {host} </p>
                      <p>Type: {details.category}</p>
                      <p>Description: {details.description}</p>
                    </Tab>

                    <Tab eventKey="attendees" title={`Attendees`}>
                      {attendeesList}
                    </Tab>
                  </Tabs>
                </div>
              </div>
 
              <div id="right">
                <div id="detailsHype">
                  <div id="details">
                    <h1>{details.title}</h1>
                    <p>{date}</p>
                    {/* <p>{details.time} </p> */}
                    <p>{timeDisplay(details.time)} </p>
                    <button
                      onClick={
                        currentUser ? handleClick : <Navigate to="/login" />
                      }
                    >
                      {attendeesListId.includes(currentUser.id)
                        ? "Unattend"
                        : "Attend"}
                    </button>
                    <p>{details.address}</p>
                    <p>
                      {details.city}, {details.state} {details.zipcode}
                    </p>
                  </div>

                  <div id="hypeMeter">
                    <HypeMeter details={details} />
                  </div>
                </div>

                <div id="map">
                  <button onClick={showTheMap}>Show me the Map</button>
                  {showMap ? (
                    <Map details={details} showForm={showForm} />
                  ) : (
                    <Map details={details} showForm={showForm} />
                  )}
                </div>

                <div id="editEvent">
                  {currentUser.id === details.host._id ? (
                    <>
                      <button
                        onClick={() => {
                          setShowForm(!showForm)
                        }}
                      >
                        Edit Event
                      </button>{" "}
                      <button onClick={deleteEvent}>Delete Event</button>
                    </>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        )
      ) : null}
    </>
  )
}

