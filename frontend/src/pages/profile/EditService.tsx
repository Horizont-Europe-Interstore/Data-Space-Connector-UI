import { Container, Row, Col, Button, FormGroup, Label, Input } from 'reactstrap';
import Card from 'react-bootstrap/Card';
import ListGroup from 'react-bootstrap/ListGroup';
import Form from 'react-bootstrap/Form';
import Dropdown from 'react-bootstrap/Dropdown';
import { Await, useLocation } from 'react-router-dom';
import React, { useState, useEffect, ChangeEvent } from 'react';
import axios from 'axios';



interface Data_catalog_category {
  code: string;
  name: string;
}


interface Data_catalog_service {
  code: string;
  name: string;
  data_catalog_category: Data_catalog_category;
}


interface Data_catalog_business_object {
  data_catalog_service: Data_catalog_service;
  name: string;

}

interface Data_catalog_data_offerings {
  id: string;
  title: string;
  data_catalog_business_object: Data_catalog_business_object;
  created_on: string;
  active_to: string;
  profile_selector: string;
  file_schema_sample_filename: string;
  file_schema_filename: string;
  file_schema_sample: string;
  file_schema: string;
  status: string;
  use_custom_semantics: string | null;
  active_from: string;
  modified_on: string;
  data_catalog_business_object_id: string;
  profile_description: string;
}

interface Data_catalog_data_offeringsCustom {
  id: string;
  title: string;
  data_catalog_business_object: Data_catalog_business_object;
  created_on: string;
  active_to: string;
  profile_selector: string;
  file_schema_sample_filename: string;
  file_schema_filename: string;
  file_schema_sample: string;
  file_schema: string;
  status: string;
  use_custom_semantics: string | null;
  active_from: string;
  modified_on: string;
  data_catalog_business_object_id: string;
}
interface ApiResponse {
  data_catalog_data_offerings: Data_catalog_data_offerings;
}
const EditService = () => {
  const [isLoading, setIsLoading] = useState(false);
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const id = queryParams.get('id');
  const [data, setData] = useState<Data_catalog_data_offerings | null>(null);
  const [dataCustom, setDataCustom] = useState<Data_catalog_data_offeringsCustom | null>(null);
  const [isLoading1, setIsLoading1] = useState(false);
  const [isLoading2, setIsLoading2] = useState(false);
  const [fileName, setFileName] = useState<string>('');
  const [fileBase64, setFileBase64] = useState<string>('');
  const [dateNotFormatted, setDateNotFormatted] = useState<string>("");
  const formatDateFromData = (dateString: string): string => {
    let formattedDate = dateString.replace(' ', 'T').slice(0, 16);
    return formattedDate;
  }
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get<ApiResponse>(`/dataset/my_offered_services/${id}`);

        setData(response.data.data_catalog_data_offerings);


      } catch (error) {
        console.error('Error fetching data: ', error);
      }
    };

    fetchData();
  }, []);

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const formattedDate = (date.toISOString()).replace(/\.(\d{3})Z$/, ".0Z")
    return formattedDate;
  };

  function disableOfferedService() {
    if (data) {
      setData({
        ...data,
        status: "disabled"
      })
      saveRequest(true)
    }

  }
  function enableOfferedService() {
    if (data) {
      setData({
        ...data,
        status: "active"
      })
      saveRequest(false)
    }

  }

  async function saveRequest(isStatusChanged: boolean) {
    setIsLoading(true);
    let state = data?.status
    if (isStatusChanged) {
      state = "disabled"
    }else{
      state = "active"
    }
    if (data) {
      const updatedData = {
        ...data,
        created_on: formatDate(data.created_on),
        active_to: formatDate(data.active_to),
        active_from: formatDate(data.active_from),
        modified_on: formatDate(data.modified_on),
        use_custom_semantics: null,
        status: state,

      };
      const requestBody = {
        data_catalog_data_offerings: updatedData,
      };

      try {
        const response = await axios.post('/dataset/my_offered_services', requestBody);
        window.location.href = '/myOfferedServices'
      } catch (error) {
        console.error('Error saving data: ', error);
      } finally {
        setIsLoading(false)
      }
    }

  }

  function handleSelect(value: string) {
    if (data) {
      setData({
        ...data,
        profile_selector: value
      });
    }

  }



  const handleDateChangeCreatedOn = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    if (data) {
      const formattedCreatedOn = formatDate(newValue);
      setData({
        ...data,
        active_from: formattedCreatedOn
      });

    }
  }

  const handleDateChangeActiveTo = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    if (data) {
      const formattedActive_to = formatDate(newValue);
      setData({
        ...data,
        active_to: formattedActive_to
      });


    };
  }

  const handleFileSchemaChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files ? event.target.files[0] : null;
    if (file && data) {

      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64String = reader.result as string;
        const base64Data = base64String.replace(/^data:.+;base64,/, 'data:text/plain;base64,');
        setData({
          ...data,
          file_schema: base64Data,
          file_schema_filename: file.name
        });
      };
      reader.onerror = (error) => {
        console.error('Error: ', error);
      };
    }
  };

  const handleFileSchemaSampleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files ? event.target.files[0] : null;
    if (file && data) {
      //setFileName(file.name);

      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64String = reader.result as string;
        const base64Data = base64String.replace(/^data:.+;base64,/, 'data:text/plain;base64,');
        setData({
          ...data,
          file_schema_sample: base64Data,
          file_schema_sample_filename: file.name
        });
      };
      reader.onerror = (error) => {
        console.error('Error: ', error);
      };
    }
  };
  const handleChange = (name: keyof Data_catalog_data_offerings, value: string) => {
    setData(prevData => {
      if (prevData === null) {
        return null;
      }
      if (name in prevData) {
        return {
          ...prevData,
          [name]: value
        };
      }
      return prevData;
    });
  };

  function downloadFile(type: string, filename: string): void {
    if (data) {

        let fileData: string = ""
        let fileName: string = ""
        if (type === "file_schema") {
            setIsLoading1(true)
            fileData = data.file_schema
            fileName = data.file_schema_filename
        } else {
            setIsLoading2(true)
            fileData = data.file_schema_sample
            fileName = data.file_schema_sample_filename
        }
        const base64Response: string = fileData.split(';base64,').pop()!;
        const blob: Blob = base64ToBlob(base64Response, 'text/plain');

        const url: string = URL.createObjectURL(blob);

        const link: HTMLAnchorElement = document.createElement('a');
        link.href = url;
        link.setAttribute('download', fileName);

        document.body.appendChild(link);
        link.click();

        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }
    if (type === "file_schema") {
        setIsLoading1(false)
    } else if (type == "file_schema_sample") {
        setIsLoading2(false)
    }

}
function base64ToBlob(base64: string, mimeType: string): Blob {
    const byteCharacters: string = atob(base64);
    const byteArrays: Uint8Array[] = [];

    for (let offset = 0; offset < byteCharacters.length; offset += 512) {
        const slice: string = byteCharacters.slice(offset, offset + 512);
        const byteNumbers: number[] = new Array(slice.length);
        for (let i = 0; i < slice.length; i++) {
            byteNumbers[i] = slice.charCodeAt(i);
        }
        const byteArray: Uint8Array = new Uint8Array(byteNumbers);
        byteArrays.push(byteArray);
    }
    return new Blob(byteArrays, { type: mimeType });
}
  return (
    <Container fluid>
      <div className='row' style={{ paddingBottom: "15px" }}>
        <div className='col-7'>
          <h2> <b><i className="fas fa-external-link-alt nav-icon" style={{ paddingRight: "8px" }}></i>  Offered services</b></h2>
          <h5>View Data Offering</h5>
        </div>
        <div className='col'>
          <div className="d-grid gap-2 d-md-flex justify-content-md-end">
            <div className="d-grid gap-2 d-md-block">

              {!isLoading && <button className="btn btn-primary me-md-2" onClick={() => saveRequest(false)} style={{ marginRight: '10px' }}>
                Save
              </button>}
              {data?.status === "active" && !isLoading && <button className="btn btn-danger" onClick={() => disableOfferedService()} style={{ marginLeft: '10px' }}>
                Disable offered Service
              </button>}

              {data?.status === "disabled" && !isLoading && <button className="btn btn-success" onClick={() => enableOfferedService()} style={{ marginLeft: '10px' }}>
                Enable offered Service
              </button>}

              {isLoading && <button className="btn btn-primary me-md-2" onClick={() => saveRequest(false)} style={{ marginRight: '10px' }}>
                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                Saving...
              </button>}
              {isLoading && <button className="btn btn-danger" onClick={() => disableOfferedService()} style={{ marginLeft: '10px' }}>
                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                Saving...
              </button>}

              
            </div>
          </div>
        </div>
      </div>

      <Card  >
        <h3 className="list-group-item-heading" style={{ paddingLeft: "20px", paddingTop: "20px" }}> <b>Basic information</b></h3>

        <ListGroup variant="flush">
          <ListGroup.Item><Label for="id">ID</Label>
            <Input type="text" name="id" id="id" placeholder={data?.id} disabled /></ListGroup.Item>
          <ListGroup.Item><Label for="title">Title</Label>
            <Input type="text" name="title" id="title" placeholder={data?.title} disabled /></ListGroup.Item>
        </ListGroup>
      </Card>



      <Card >
        <h3 className="list-group-item-heading" style={{ paddingLeft: "20px", paddingTop: "20px" }}><b>Offered Services</b></h3>
        <h6 style={{ paddingLeft: " 20px" }}>Select Offered Service For This Subscription Request</h6>
        <ListGroup variant="flush">
          <ListGroup.Item><Label for="id">Businnes object</Label>
            <Input type="text" name="id" id="id" placeholder={data?.data_catalog_business_object.name} disabled />


          </ListGroup.Item>
          <ListGroup.Item>
            <Row form>
              <Col md={6}>
                <FormGroup>
                  <Label for="serviceCode">Service Code</Label>
                  <Input type="text" name="serviceCode" id="serviceCode" placeholder={data?.data_catalog_business_object.data_catalog_service.code} disabled />
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label for="serviceName">Service Name</Label>
                  <Input type="text" name="serviceName" id="serviceName" placeholder={data?.data_catalog_business_object.data_catalog_service.name} disabled />
                </FormGroup>
              </Col>
            </Row>
          </ListGroup.Item>
          <ListGroup.Item>
            <Row form>
              <Col md={6}>
                <FormGroup>
                  <Label for="serviceCode">Category code</Label>
                  <Input type="text" name="categoryCode" id="categoryCode" placeholder={data?.data_catalog_business_object.data_catalog_service.data_catalog_category.code} disabled />
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label for="serviceName">Category Name</Label>
                  <Input type="text" name="categoryName" id="categoryName" placeholder={data?.data_catalog_business_object.data_catalog_service.data_catalog_category.name} disabled />
                </FormGroup>
              </Col>
            </Row>
          </ListGroup.Item>
        </ListGroup>
      </Card>

      <Card >
        <h3 className="list-group-item-heading" style={{ paddingLeft: "20px", paddingTop: "20px" }}><b>Date Restrictions</b></h3>
        <h6 style={{ paddingLeft: " 20px" }}>On This Section You Can Restrict Access At A Specific Date Time Range For Service.</h6>
        <ListGroup variant="flush">
          <ListGroup.Item>
            {data && <Row form>
              <Col >
                <FormGroup>
                  <Label for="serviceCode">Active from </Label>
                  <Input type="datetime-local" name="activeFrom" id="activeFrom" value={formatDateFromData(data?.active_from)} onChange={handleDateChangeCreatedOn} />
                </FormGroup>
              </Col>
              <Col  >
                <FormGroup >
                  <Label for="serviceCode">Active to</Label>
                  <Input type="datetime-local" name="activeTo" id="activeTo" value={formatDateFromData(data?.active_to)} onChange={handleDateChangeActiveTo} />
                </FormGroup >
              </Col>
            </Row>}
          </ListGroup.Item>

        </ListGroup>
      </Card>



      <Card >
        <h3 className="list-group-item-heading" style={{ paddingLeft: "20px", paddingTop: "20px" }}><b>Semantic Definition</b></h3>
        <ListGroup variant="flush">
          <ListGroup.Item><Label for="fileSchema">File schema: {data?.file_schema_filename}</Label>
            <div className='row d-flex flex-nowrap'>
              <div className='col'>
                <Input
                  type="file"
                  name="fileSchema"
                  id="fileSchema"
                  onChange={handleFileSchemaChange}
                  placeholder={data?.file_schema_filename}
                />
              </div>
              {data?.file_schema && <div className='col-2'>
                                {!isLoading1 && <button className="btn btn-primary" onClick={() => downloadFile("file_schema", "file_schema_filename")}>
                                    Download
                                </button>}

                                {isLoading1 && <button className="btn btn-primary" onClick={() => downloadFile("file_schema", "file_schema_filename")}>
                                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                    Downloading...
                                </button>}
                                
                            </div>}

                            {!data?.file_schema && <div className='col-2'>
                                {!isLoading1 && <button className="btn btn-primary" onClick={() => downloadFile("file_schema", "file_schema_filename")} disabled>
                                    Download
                                </button>}

                                {isLoading1 && <button className="btn btn-primary" onClick={() => downloadFile("file_schema", "file_schema_filename")} disabled>
                                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                    Downloading...
                                </button>}
                                
                            </div>}
            </div>
          </ListGroup.Item>




          <ListGroup.Item><Label for="id">File schema Sample: {data?.file_schema_sample_filename}</Label>
            <div className='row d-flex flex-nowrap'>
              <div className='col'>
                <Input
                  type="file"
                  name="fileSchema"
                  id="fileSchema"
                  onChange={handleFileSchemaSampleChange}
                  placeholder={data?.file_schema_sample_filename}
                />
              </div>
              {data?.file_schema_sample && <div className='col-2'>


{!isLoading2 && <button className="btn btn-primary" onClick={() => downloadFile("file_schema_sample", "file_schema_sample_filename")}>
    Download
</button>}

{isLoading2 && <button className="btn btn-primary" onClick={() => downloadFile("file_schema_sample", "file_schema_sample_filename")}>
    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
    Downloading...
</button>}

</div>}

{!data?.file_schema_sample && <div className='col-2'>


{!isLoading2 && <button className="btn btn-primary" onClick={() => downloadFile("file_schema_sample", "file_schema_sample_filename")} disabled>
    Download
</button>}

{isLoading2 && <button className="btn btn-primary" onClick={() => downloadFile("file_schema_sample", "file_schema_sample_filename")} disabled>
    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
    Downloading...
</button>}

</div>}
            </div>

          </ListGroup.Item>
          <ListGroup.Item>
            <Dropdown drop='up'>
              <Dropdown.Toggle id="dropdown-basic" >
                Profile Format: {data?.profile_selector}
              </Dropdown.Toggle>

              <Dropdown.Menu>
                <Dropdown.Item >------</Dropdown.Item>
                <Dropdown.Item onClick={() => handleSelect('Xml')}>Xml</Dropdown.Item>
                <Dropdown.Item onClick={() => handleSelect('Json Ld')}>Json Ld</Dropdown.Item>
                <Dropdown.Item onClick={() => handleSelect('Json')}>Json</Dropdown.Item>
                <Dropdown.Item onClick={() => handleSelect('Csv')}>Csv</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>

          </ListGroup.Item>


          <ListGroup.Item><Label for="id">Profile Description</Label>
            <Input type="text" name="profileDescription" id="profileDescription" value={data?.profile_description} placeholder="Enter Profile Description" onChange={(e) => handleChange('profile_description', e.target.value)} />
          </ListGroup.Item>


        </ListGroup>
      </Card>

    </Container>
  );
};

export default EditService;

