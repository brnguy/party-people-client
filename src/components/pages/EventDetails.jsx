import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom'
import axios from "axios"
import { Tab, Tabs } from 'react-bootstrap';
import Map from './Map';


const dayjs = require('dayjs')

export default function EventDetails({ currentUser }) {
    const { id } = useParams()
    const [details, setDetails]= useState([])
    const [date, setDate] = useState()
    const [attendees, setAttendees] = useState([])
    const [attendeesId, setAttendeesId] = useState([])
    const [host,setHost]= useState()
    

    const [attending, setAttending] = useState(currentUser && attendeesId.includes(currentUser.id))

    const handleClick = async () => {
        if(attending) {
            await axios.put(`${process.env.REACT_APP_SERVER_URL}/api-v1/events/${id}/${currentUser.id}/unattend`)
            setAttending(!attending)
            setAttendees(attendees.filter(attendee => {
                return attendee !== currentUser.name
            }))
        } else {
            await axios.put(`${process.env.REACT_APP_SERVER_URL}/api-v1/events/${id}/${currentUser.id}/attend`)
            setAttending(!attending)
        }
    }


    useEffect(() => { 
        async function fetchData(){
            const eventDetails = await axios.get(`${process.env.REACT_APP_SERVER_URL}/api-v1/events/${id}`)
            setDetails(eventDetails.data)
            setDate(dayjs(eventDetails.data.date).format('dddd MMMM D YYYY'))
            setHost(eventDetails.data.host.name) 
            eventDetails.data.attendees.forEach(attendee => {
                setAttendees([...attendees, attendee.name])
                setAttendeesId([...attendeesId, attendee._id])
            })
            //https://api.mapbox.com/geocoding/v5/mapbox.places/815%20n%2052nd%20.json?limit=1&proximity=ip&types=place%2Cpostcode%2Caddress&access_token=pk.eyJ1IjoidHJpc3RvbnBhbGFjaW9zIiwiYSI6ImNsMWF5bXJwZTJheDIzbHYwMnMzZnZucmcifQ.dZGAzZPAmn39U28QyzwPVQ
        }
        
        fetchData()
    }, [attending])
    
    return(
        <>
            {currentUser ?
                <>  
                    <img src="http://placekitten.com/1300/400" alt={`${details.title}-image`}/>

                    <div id="eventHeader">
                        <h1>{details.title}</h1>
                        <button onClick={handleClick}>{attending ? 'Unattend' : 'Attend'} </button>
                    </div>

                    <div id="details">
                        <h2>Host: {host} </h2>
                        <h3>{details.category}</h3>
                        <p>{date}</p>
                        <p>{details.address}</p>
                        <p>{details.city}, {details.state} {details.zipcode}</p>
                    </div>


                    <Tabs defaultActiveKey="Description" id="tabs" className="right">
                        <Tab eventKey="description" title="Description">
                            {details.description}
                        </Tab>

                        <Tab eventKey="attendees" title={`Attendees`}>
                            {attendees}
                        </Tab>
                    </Tabs>
                </>
            : null}
            <Map details={details}/>
        </>
    )

}