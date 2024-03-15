import { PfImage } from '@profabric/react-components';
import { format } from 'date-fns';
import React, { useEffect, useState } from 'react';
import { VerticalTimeline, VerticalTimelineElement } from 'react-vertical-timeline-component';
import 'react-vertical-timeline-component/style.min.css';
import axios from 'axios';
import { Button, Container } from 'react-bootstrap';
import { DetailDataEntity, EditDataEntity } from '@app/components/helpers/Buttons';
if (localStorage.getItem("token")) {
  axios.defaults.headers.common["Authorization"] = `Bearer ${localStorage.getItem("token")}`;
}
interface ApiResponseReg {
  pid: string;
  smartContractAddress: string;
}

interface ApiResponseURLs {
  ecc_url: string;
  broker_url: string;
  data_app_url: string;
}
interface ApiResponse {
  isTheLastPage: boolean;
  resultList: ResultList[]; // Ideally, define a more specific interface for the objects inside the array
}

interface ResultList {
  left_side: number;
  description: string;
  title: string
  nav: string;
}

const TimelineTab = ({ isActive }: { isActive: boolean }) => {
  const [data, setData] = useState<ResultList[]>([]);
  const [currentPage, setCurrentPage] = useState(2);
  const [createdBefore, setcreatedBefore] = useState("");
  const [createdAfter, setcreatedAfter] = useState("");
  const [isButtonPressed, setisButtonPressed] = useState(false);
  const [isTheLastPage, setIsTheLastPage] = useState<boolean>(false);
  const [dataURLs, setDataURLs] = useState<ApiResponseURLs>({} as ApiResponseURLs);
  const [checkResults, setCheckResults] = useState<Record<string, boolean | string>>({})
 

  useEffect(() => {
fetchData();
    fetchUrls();
  }, []);
  const fetchUrls = async () => {
    axios.get<ApiResponseURLs[]>(`/custom-query/data-objects/?id=e48046c9-0b94-41d2-9ad4-206f1604b821`)
      .then(response => {
        setDataURLs(response.data[0]);

      })
      .catch(error => {
        console.error('Error fetching media:', error);
      });
  };

  const fetchData = async () => {
    try {
      const response = await axios.get<ApiResponse>(`/timeline/data/?id=d6342c52-8995-4a0d-b42d-894ffc600a3d&enabled=1&created_after=${convertToISOFormat(createdAfter)}&created_before=${convertToISOFormat(createdBefore)}&currentPage=1`);
      setData(response.data.resultList);
      setIsTheLastPage(response.data.isTheLastPage);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  async function checkSmartContract(id: string) {

    const url = new URL(dataURLs.data_app_url)
    const requestBody = {
      "entityId": `urn:ngsi-ld:dataentity:${id}`,
      "eccUrl": `${dataURLs.ecc_url}`
    };
    try {
      const fullUrl = `${url.protocol}//localhost:${url.port}/data-app-consumer/registration`;
      const response = await axios.post<ApiResponseReg>(`${window.location.protocol}//${window.location.host}/data-app-consumer/registration`, requestBody);
      if (response.data.smartContractAddress) {

        setCheckResults(prevResults => ({
          ...prevResults,
          [id]: (response.data.smartContractAddress)
        }));
      }
      else {
        setCheckResults(prevResults => ({
          ...prevResults,
          [id]: ("NaN")
        }));
      }
      return response.data.smartContractAddress
    } catch (error: any) {
      console.error('Error saving data: ', error);
      if (error.response.data.smartContractAddress) {

        setCheckResults(prevResults => ({
          ...prevResults,
          [id]: (error.response.data.smartContractAddress)
        }));
      }
      else {
        setCheckResults(prevResults => ({
          ...prevResults,
          [id]: ("NaN")
        }));
      }
      return error.response.data.smartContractAddress
    }
  }

  const expandWindow = async () => {

    try {
      setCurrentPage(currentPage + 1);
      const response = await axios.get<ApiResponse>(`/timeline/data/?id=d6342c52-8995-4a0d-b42d-894ffc600a3d&enabled=1&created_after=${convertToISOFormat(createdAfter)}&created_before=${convertToISOFormat(createdBefore)}&currentPage=${currentPage}`);
      setData(prevData => [...prevData, ...response.data.resultList]);
      setIsTheLastPage(response.data.isTheLastPage);
    } catch (error) {
      setCurrentPage(currentPage - 1);
      console.error('Error fetching data:', error);
    }


  }

  const setTabProperties = (side: number) => {
    let position: string;
    if (side === 0) {
      position = "right"

    } else { //is left
      position = "left"
    }

    return [position];
  }
  function mysubstring(byString: string) {
    var mySubString = byString.substring(
      byString.indexOf("SELECTION-ID=") + 13,
      byString.lastIndexOf("),")
    );
    return mySubString;
  }
  const handleCreatedAfterChange = (e: { target: { value: React.SetStateAction<string>; }; }) => {
    
    setcreatedAfter(e.target.value);

  };

  const handleCreatedBeforeChange = (e: { target: { value: React.SetStateAction<string>; }; }) => {
    setcreatedBefore(e.target.value);

  };
  const resetDates = () => {
    setcreatedAfter('');
    setcreatedBefore('');
    setisButtonPressed(true)
  };

  const filterDates = () => {
    fetchData();
  };

  const convertToISOFormat = (localDateTime: string | number | Date) => {
    if (!localDateTime) return '';

    const date = new Date(localDateTime);

    return date.toISOString();
  };

  useEffect(() => {
    if (isButtonPressed === true){
      fetchData()
      setisButtonPressed( false)
    }
    
  }, [createdBefore,createdAfter,isButtonPressed]);

  
function replaceDateString(input: string): string {
  const isoDatePattern = /isoToClientDateTimeFormat\(([^)]+)\)/;
  const match = input.match(isoDatePattern);

  if (match) {
    const isoDateString = match[1]; 
    const formattedDate = format(new Date(isoDateString), 'dd/MM/yyyy HH:mm'); 
    return input.replace(isoDatePattern, formattedDate);
  }

  return input; 
}
  
  return (
    <Container fluid>
      <div className='row'>
        <div className='col'>
          <h2><i className="fas fa-stream nav-icon" style={{ paddingRight: "8px" }}></i> <b>Data Exchanges Timeline</b></h2>
          <h5>View your data exchange history</h5>
        </div>
        <div className='col'>
          <div className='row'>
            <label >
              From: {""}
              <input
                type="datetime-local"
                value={createdAfter}
                onChange={handleCreatedAfterChange}
                name="createdAfter" />
            </label>
            <label style={{ paddingLeft: "5px" }}>
              To: {""}  <input
                type="datetime-local"
                value={createdBefore}
                onChange={handleCreatedBeforeChange}
                name="createdBefore"
              />
            </label>

            <Button type="button" className="btn btn-primary" onClick={filterDates} style={{ scale: "0.6", marginTop: "-8px" }}>
              <i className="fas fa-search nav-icon" style={{ paddingRight: "4px" }}></i>
              Filter
            </Button>
           {(createdAfter || createdBefore) && <Button type="button" className="btn btn-danger" onClick={resetDates} style={{ scale: "0.6", marginTop: "-8px", marginLeft: "-15px" }}>
              <i className="fas fa-trash nav-icon" style={{ paddingRight: "4px" }}></i>
              Reset
            </Button>}</div> 
        </div>
      </div>
      <VerticalTimeline>
        {data?.map((item, index) => (
          <VerticalTimelineElement
            key={index}
            icon={item.left_side === 1 ? <i className="fa fa-cloud-upload-alt" style={{ position: 'absolute', top: '20px', left: '+20px', scale: "200%" }}></i> : <i className="fa fa-cloud-download-alt" style={{ position: 'absolute', top: '20px', left: '+20px', scale: "200%" }}> </i>}
            className="vertical-timeline-element--work"
            contentStyle={{ background: 'white', color: 'black' }}
            contentArrowStyle={{ borderRight: '7px solid  rgb(33, 150, 243)' }}
            position={setTabProperties(item.left_side)[0]}
            iconStyle={{ background: 'rgb(33, 150, 243)', color: '#fff', }}
          >
            <h3 className="vertical-timeline-element-title"><b>{item.title}</b></h3>
            <p dangerouslySetInnerHTML={{ __html: replaceDateString(item.description) }}></p>

            {item.left_side === 0 && checkResults[mysubstring(item.nav)] && checkResults[mysubstring(item.nav)] !== "NaN" && <a href={"https://mumbai.polygonscan.com/address/" + checkResults[mysubstring(item.nav)]} target="_blank" rel="noopener noreferrer">link to the smart contract</a>}
            {item.left_side === 0 && checkResults[mysubstring(item.nav)] && checkResults[mysubstring(item.nav)] === "NaN" && <b style={{ color: "red" }}>There is no smart contract available for this data</b>}
            <div className='row'>
              
            {item.left_side === 0 && !checkResults[mysubstring(item.nav)]&& <Button onClick={() => checkSmartContract(mysubstring(item.nav))} className="btn btn-success" style={{ scale: "0.9" }}>
                Check for Smart Contract <i className="fa fa-plus"></i>
              </Button>}
                
            {item.left_side === 0 && checkResults[mysubstring(item.nav)]&& <Button onClick={() => checkSmartContract(mysubstring(item.nav))} className="btn btn-success" style={{ scale: "0.9" }} disabled>
                Check for Smart Contract <i className="fa fa-plus"></i>
              </Button>}

              
               <Button className="btn btn-primary" onClick={() => DetailDataEntity(mysubstring(item.nav))}>
                <i className="fas fa-search"></i> Data detail
              </Button>
            </div>
          </VerticalTimelineElement>
        ))}
      </VerticalTimeline>
      <div className='row' style={{ alignContent: "center", justifyContent: "center", paddingTop: "290 px" }}>
      { !isTheLastPage && <Button className="btn btn-light" onClick={() => expandWindow()} style={{ backgroundColor: "transparent", scale: "2.5", border: "none", paddingTop: "8px", color: "rgb(33, 150, 243)" }} data-toggle="tooltip" data-placement="top" title="Expand the timeline">
          <i className="fas fa-angle-down"></i>
        </Button>}
      </div>
    </Container>
  );

};

export default TimelineTab;
