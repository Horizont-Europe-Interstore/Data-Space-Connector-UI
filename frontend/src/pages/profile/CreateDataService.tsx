import { Container, Row, Col,  FormGroup, Label, Input } from 'reactstrap';
import Card from 'react-bootstrap/Card';
import ListGroup from 'react-bootstrap/ListGroup';
import Dropdown from 'react-bootstrap/Dropdown';
import { useLocation } from 'react-router-dom';
import React, { useState,  ChangeEvent } from 'react';
import BusinnesObject from '../modals/BusinnesObject_CreateService';
import { toast } from 'react-toastify';
import axiosWithInterceptorInstance from '@app/components/helpers/AxiosConfig';
interface User_1_1 {
  id: string;
  email: string;
  username: string;
}

interface DataCatalogCategory {
  code: string;
  name: string;
  id: string;
  short_order: string;
}

interface DataCatalogService {
  short_description: string;
  data_catalog_category_id: string;
  code: string;
  name: string;
  id: string;
  short_order: string;
  data_catalog_category: DataCatalogCategory;
}

interface DataCatalogBusinessObject {
  file_schema_filename: string;
  file_schema: string;
  code: string;
  data_catalog_service_id: string;
  file_schema_sample: string;
  profile_selector: string;
  name: string;
  id: string;
  data_catalog_service: DataCatalogService;
  profile_description: string;
  file_schema_sample_filename: string;
  short_order: string;
}

interface Company {
  modified_on: string;
  address: string;
  created_on: string;
  phone: string;
  modified_by: string;
  name: string;
  description: string;
  id: string;
  created_by: string;
}

interface User {
  sidebar_menu_id: string;
  provider_appdata_url: string;
  provider_user_id: string;
  broker_url: string;
  provider_fiware_url: string;
  short_order: string;
  enabled: string;
  header_menu_id: string;
  ecc_url: string;
  password: string;
  search_nav_command: string;
  provider: string;
  consumer_fiware_url: string;
  company: Company;
  id: string;
  email: string;
  modified_on: string;
  current_language_id: string;
  login_nav_command: string;
  company_id: string;
  created_by: string;
  created_on: string;
  modified_by: string;
  default_language_id: string;
  is_onenet: string;
  dateformat: string;
  ed_api_url: string;
  status: string;
  username: string;
  data_app_url: string;
}
interface DataCatalogDataOfferings {
  id: null;
  file_schema_filename: string;
  active_from_enable: number;
  active_to_enable: number;
  file_schema: string;
  comments: string;
  input_data_source: string;
  input_profile: string;
  profile_description: string;
  file_schema_sample_filename: string;
  created_by: string;
  user_1_1: User_1_1;
  data_catalog_business_object_id: string;
  created_on: string;
  file_schema_sample: string;
  profile_selector: string;
  modified_by: string;
  data_catalog_business_object: DataCatalogBusinessObject;
  user: User;
  title: string;
  type: string;
  active_to: string;
  active_from: string;
  status: string;
  topic: string;
  updating_frequency: number;
}

interface ApiResponse {
  data_catalog_data_offerings: DataCatalogDataOfferings;
}

const CreateDataService = () => {
  const formatDateFromData = (dateString: string): string => {
    let formattedDate = dateString.replace(' ', 'T').slice(0, 16);
    return formattedDate;
  }
  const data_catalog_data_offerings: DataCatalogDataOfferings = {
    active_from_enable: 0,
    active_to_enable: 0,
    status: "active",
    id: null,
    file_schema_filename: "",
    file_schema: "",
    comments: "",
    input_data_source: "",
    input_profile: "",
    profile_description: "",
    file_schema_sample_filename: "",
    created_by: "",
    user_1_1: {
      id: "",
      email: "",
      username: ""
    },
    data_catalog_business_object_id: "",
    created_on: "",
    file_schema_sample: "",
    profile_selector: "",
    modified_by: "",
    data_catalog_business_object: {
      file_schema_filename: "",
      file_schema: "",
      code: "",
      data_catalog_service_id: "",
      file_schema_sample: "",
      profile_selector: "",
      name: "",
      id: "",
      data_catalog_service: {
        short_description: "",
        data_catalog_category_id: "",
        code: "",
        name: "",
        id: "",
        short_order: "",
        data_catalog_category: {
          code: "",
          name: "",
          id: "",
          short_order: ""
        }
      },
      profile_description: "",
      file_schema_sample_filename: "",
      short_order: ""
    },
    user: {
      sidebar_menu_id: "",
      provider_appdata_url: "",
      provider_user_id: "",
      broker_url: "",
      provider_fiware_url: "",
      short_order: "",
      enabled: "",
      header_menu_id: "",
      ecc_url: "",
      password: "",
      search_nav_command: "",
      provider: "",
      consumer_fiware_url: "",
      company: {
        modified_on: "",
        address: "",
        created_on: "",
        phone: "",
        modified_by: "",
        name: "",
        description: "",
        id: "",
        created_by: ""
      },
      id: "",
      email: "",
      modified_on: "",
      current_language_id: "",
      login_nav_command: "",
      company_id: "",
      created_by: "",
      created_on: "",
      modified_by: "",
      default_language_id: "",
      is_onenet: "",
      dateformat: "",
      ed_api_url: "",
      status: "",
      username: "",
      data_app_url: ""
    },
    title: '',
    type: "data",
    active_to: buildDefaultActiveTo(),
    active_from: new Date().toISOString(),
    topic: "",
    updating_frequency: 60
  };
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const id = queryParams.get('id');
  const [data, setData] = useState<DataCatalogDataOfferings | null>(data_catalog_data_offerings);
  const [modalStates, setModalStates] = useState({
    BOModal: false
  });

  const [cardElements, setCardElements] = useState({
    businnesObjectName: "",
    serviceCode: "",
    serviceName: "",
    categoryCode: "",
    categoryName: "",
  });
  const [filterValuesFromModals, setFilterValuesFromModals] = useState({
    catalog_business_object_id: ""
  });

  function buildDefaultActiveTo() {
    let today = new Date();
    let activeTo = new Date(today.getTime() + 15 * 24 * 60 * 60 * 1000)
    return activeTo.toISOString()
  }

  async function saveRequest() {
    if (!data?.title || !data?.data_catalog_business_object_id) {
      toast.error('Please fill out all required fields(*).');
      return;
    }
    const requestBody = {
      data_catalog_data_offerings: data
    };
    try {
      const response = await axiosWithInterceptorInstance.post('/dataset/my_offered_services', requestBody);
      window.location.href = '/myOfferedServices?type=data'
    } catch (error) {
      console.error('Error saving data: ', error);
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

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const formattedDate = (date.toISOString()).replace(/\.(\d{3})Z$/, ".000000Z")
    return formattedDate;
  };

  const handleDateChangeActiveFrom = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    if (data) {
      const formattedActiveFrom = (formatDate(newValue));

      setData({
        ...data,
        active_from: formattedActiveFrom,
        //active_from_enable: "1"
      });
    }
  }

  const handleDateChangeActiveTo = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    if (data) {
      const formattedActive_to = (formatDate(newValue));
      setData({
        ...data,
        active_to: formattedActive_to,
        //active_to_enable: "1"
      });
    };
  }
  const handleActiveFromEnableChange = () => {
    setData(prevData => {
      if (!prevData) return null;
      return {
        ...prevData,
        active_from_enable: prevData.active_from_enable === 0 ? 1 : 0
      };
    });
  };

  const handleActiveToEnableChange = () => {
    setData(prevData => {
      if (!prevData) return null;
      return {
        ...prevData,
        active_to_enable: prevData.active_to_enable === 0 ? 1 : 0
      };
    });
  };
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
          file_schema_filename: file.name,
          file_schema: base64Data
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
  const handleOpenModal = (modalName: string) => {
    setModalStates({ ...modalStates, [modalName]: true });
  };

  const handleCloseModal = (modalName: string) => {
    setModalStates({ ...modalStates, [modalName]: false });
  };
  const handleModalDataChange = (modalName: string, value: string[]) => {
    if (data) {
      setData({
        ...data,
        data_catalog_business_object_id: value[0],
      });

      setCardElements({
        serviceCode: value[1],
        serviceName: value[2],
        categoryCode: value[3],
        categoryName: value[4],
        businnesObjectName: value[5],
      })

    }
  };

  const handleChange = (name: keyof DataCatalogDataOfferings, value: string) => {
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

  return (
    <Container fluid>

      <div className='row' style={{ paddingBottom: "15px" }}>
        <div className='col-7'>
          <h2> <b><i className="fas fa-external-link-alt nav-icon" style={{ paddingRight: "8px" }}></i> Offered Service</b></h2>
          <h5>Create a new Data Offering </h5>
        </div>
        <div className='col'>
          <div className="d-grid gap-2 d-md-flex justify-content-md-end">
            <div className="d-grid gap-2 d-md-block">

              <button className="btn btn-primary" onClick={() => saveRequest()}>
                Save
              </button>

            </div>
          </div>
        </div>

      </div>
      <Card >
        <h3 className="list-group-item-heading" style={{ paddingLeft: "20px", paddingTop: "20px" }}> <b>Basic information</b></h3>

        <ListGroup variant="flush">
          <ListGroup.Item><Label for="id">ID</Label>
            <Input type="text" name="id" id="id" disabled /></ListGroup.Item>

          <ListGroup.Item><Label for="title">Title*</Label>
            <Input type="text" name="title" id="title" value={data?.title} onChange={(e) => handleChange('title', e.target.value)} /></ListGroup.Item>
        </ListGroup>
      </Card>

      <Card >
        <h3 className="list-group-item-heading" style={{ paddingLeft: "20px", paddingTop: "20px" }}> <b>Businnes object*</b></h3>
        <h6 className="list-group-item-heading" style={{ paddingLeft: " 20px" }}>Select Business Object For This Data Offering</h6>
        <ListGroup variant="flush">
          <ListGroup.Item>
            <button onClick={() => handleOpenModal('BOModal')} className="btn btn-outline-secondary" type="button" id="button-addon1">
              <i className="fas fa-search nav-io"></i>
              Businnes object:  {!cardElements.businnesObjectName && "please select one option"} {cardElements.businnesObjectName}
            </button>
          </ListGroup.Item>
          <ListGroup.Item>
            <Row form>
              <Col md={6}>
                <FormGroup>
                  <Label for="serviceCode">Service Code</Label>
                  <Input type="text" name="serviceCode" id="serviceCode" value={cardElements.serviceCode} />
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label for="serviceName">Service Name</Label>
                  <Input type="text" name="serviceName" id="serviceName" value={cardElements.serviceName} />
                </FormGroup>
              </Col>
            </Row>
          </ListGroup.Item>
          <ListGroup.Item>
            <Row form>
              <Col md={6}>
                <FormGroup>
                  <Label for="serviceCode">Category code</Label>
                  <Input type="text" name="categoryCode" id="categoryCode" value={cardElements.categoryCode} />
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label for="serviceName">Category Name</Label>
                  <Input type="text" name="categoryName" id="categoryName" value={cardElements.categoryName} />
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
                  <Input type="datetime-local" name="activeFrom" id="activeFrom" placeholder={formatDateFromData(data?.active_from)} onChange={handleDateChangeActiveFrom} />
                </FormGroup>
              </Col>
              <Col md={3} className="d-flex justify-content-center align-items-center">
                <FormGroup check className="d-flex align-items-center justify-content-md-center mb-0">
                  <Label check className="mb-0">
                    <Input
                      type="checkbox"
                      checked={data.active_from_enable === 1}
                      onChange={handleActiveFromEnableChange}
                    />
                    {' '}The service is valid from the date
                  </Label>
                </FormGroup>
              </Col>

            </Row>}


            {data && <Row form>
              <Col >
                <FormGroup >
                  <Label for="serviceCode">Active to</Label>
                  <Input type="datetime-local" name="activeTo" id="activeTo" placeholder={formatDateFromData(data?.active_to)} onChange={handleDateChangeActiveTo} />
                </FormGroup >
              </Col>
              <Col md={3} className="d-flex justify-content-center align-items-center">
                <FormGroup check className="d-flex align-items-center justify-content-md-center mb-0">
                  <Label check className="mb-0">
                    <Input
                      type="checkbox"
                      checked={data.active_to_enable === 1}
                      onChange={handleActiveToEnableChange}
                    />
                    {' '}The service is valid until the date
                  </Label>
                </FormGroup>
              </Col>
            </Row>}

          </ListGroup.Item>

        </ListGroup>
      </Card>
      <Card >
        <h3 className="list-group-item-heading" style={{ paddingLeft: "20px", paddingTop: "20px" }}> <b>NATS parameters</b></h3>
        <h6 className="list-group-item-heading" style={{ paddingLeft: " 20px" }}>Select topic and updating frequency for the NATS plugin</h6>
        <ListGroup variant="flush">
          <ListGroup.Item>
            <Row form>
              <Col md={6}>
                <FormGroup>
                  <Label for="serviceCode">Topic</Label>
                  <Input type="text" name="topic" id="topic" value={data?.topic} onChange={(e) => handleChange('topic', e.target.value)} />
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label for="serviceName">Updating Frequency (60 is the default value)</Label>
                  <Input type="text" name="updating_frequency" id="updating_frequency" value={data?.updating_frequency} onChange={(e) => handleChange('updating_frequency', e.target.value)} />
                </FormGroup>
              </Col>
            </Row>
          </ListGroup.Item>
        </ListGroup>
        {/* <ListGroup variant="flush">
            <ListGroup.Item><Label for="title">Topic</Label>
            <Input type="text" name="title" id="title" value={data?.topic} onChange={(e) => handleChange('topic', e.target.value)} />
          </ListGroup.Item>

          <ListGroup.Item><Label for="title">Updating Frequency</Label>
            <Input type="text" name="title" id="title" value={data?.updating_frequency} onChange={(e) => handleChange('updating_frequency', e.target.value)} />
          </ListGroup.Item>
        </ListGroup> */}
      </Card>

      <Card >
        <h3 className="list-group-item-heading" style={{ paddingLeft: "20px", paddingTop: "20px" }}> <b>Semantic Definition</b> </h3>
        <ListGroup variant="flush">
          <ListGroup.Item><Label for="fileSchema">File schema</Label>
            <Input
              type="file"
              name="fileSchema"
              id="fileSchema"
              onChange={handleFileSchemaChange}
              placeholder="Enter File"
            />


          </ListGroup.Item>
          <ListGroup.Item><Label for="id">File schema Sample</Label>
            <Input
              type="file"
              name="fileSchemaSample"
              id="fileSchemaSample"
              onChange={handleFileSchemaSampleChange}
              placeholder="Enter File"
            />


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
            <Input type="text" name="profileDescription" id="profileDescription" placeholder="Enter Profile Description" onChange={(e) => handleChange('profile_description', e.target.value)} />
          </ListGroup.Item>
        </ListGroup>
      </Card>

      {modalStates.BOModal && (
        <BusinnesObject
          show={modalStates.BOModal}
          handleClose={() => handleCloseModal('BOModal')}
          onModalDataChange={handleModalDataChange}
        />
      )}

    </Container>
  );
};

export default CreateDataService;

