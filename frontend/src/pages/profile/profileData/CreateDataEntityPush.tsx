import { Container,Label, Input } from 'reactstrap';
import Card from 'react-bootstrap/Card';
import ListGroup from 'react-bootstrap/ListGroup';
import Form from 'react-bootstrap/Form';
import { useLocation } from 'react-router-dom';
import { useState, useEffect, ChangeEvent } from 'react';
import ServicePush from '@app/pages/modals/Service_CreateDataPush';
import { RetrieveLocalApi } from '@app/components/helpers/RetrieveLocalApi';
import { toast } from 'react-toastify';
import axiosWithInterceptorInstance from '@app/components/helpers/AxiosConfig';
interface Provider {
  id: string;
  broker_url: string;
  ecc_url: string;
  provider_fiware_url: string;
  ed_api_url: string
}

interface Data_send {
  created_by: string;
  fileName: string;
  data_catalog_data_offerings_id: string;
  description: string;
  title: string;
  fileSize: number;
  push_uri:string;
  message: string;
  "sub-entities": {
    provider: Provider;
  };

}

interface ApiResponse {
  data_send: Data_send;
}
const CreateDataEntityPush = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [modalStates, setModalStates] = useState({
    DataOfferingModal: false
  });
  const [filterValuesFromModals, setFilterValuesFromModals] = useState({

    data_offering: ""

  });

  const datasend: Data_send = {
    fileName: "",
    data_catalog_data_offerings_id: "",
    description: "",
    title: "",
    fileSize: 0,
    message: "",
    push_uri:"",
    "sub-entities": {
      provider: {
        id: "",
        broker_url: "",
        ecc_url: "",
        provider_fiware_url: "",
        ed_api_url: ''

      },
    },
    created_by: ''
  };
  const [cardElements, setCardElements] = useState({
    title: "",
    profileFormat: "",
    profileDescription: "",
    businnesObjectCode: "",
    businnesObjectName: "",
    serviceCode: "",
    serviceName: "",
    categoryCode: "",
    categoryName: "",
    push_uri:"",

  });
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const id = queryParams.get('id');
  const [data, setData] = useState<Data_send >(datasend);



  useEffect(() => {
    axiosWithInterceptorInstance.get(`/custom-query/data-objects/?id=e48046c9-0b94-41d2-9ad4-206f1604b821`)
      .then(response => {
        const dataConnector = response.data[0];
        setData((prevData) => ({
          ...prevData,
          created_by: dataConnector?.id,
          ["sub-entities"]: {
            ...prevData["sub-entities"],
            provider: {
              ...prevData["sub-entities"]?.provider,
              id: dataConnector?.id,
              broker_url: dataConnector?.broker_url,
              ecc_url: dataConnector?.ecc_url,
              provider_fiware_url: dataConnector?.data_app_url,
              ed_api_url: dataConnector?.ed_api_url,
            },
          },
        }));
      })
      .catch(error => {
        console.error('Error fetching media:', error);
      
      });
  }, []);

  async function saveRequest() {
    const settingsResponse = await RetrieveLocalApi();
    const apiRetrived= settingsResponse.ed_api_url;
    console.log("apiRetrived")
    console.log(apiRetrived)
    if (!data?.title || !data?.data_catalog_data_offerings_id || !data.message) {
      toast.error('Please fill out all required fields(*).');
      return;
    }
    setIsLoading(true);
    console.log("oggetto pre modifica")
    console.log(data);
    data.push_uri=cardElements.push_uri;
    console.log("oggetto post modifica")
    console.log(data)
    const requestBody = {
      data_send: data
    };
    try {
      console.log("input del caricamento dati ")
      console.log(requestBody); // qui devo aggiungere il push_uri alla richiesta 
      const responseRequest = await axiosWithInterceptorInstance.post(`${apiRetrived}/entity?id=050bd6b5-7466-4db1-bcdf-57c835e53bbc`, requestBody);
      console.log("risposta al servizio ")
      console.log(responseRequest);
      console.log(responseRequest.data.responseCode);
      if (responseRequest.data.responseCode==="200") {
        toast.success('Data entity send to push_uri service');
      }else{
        toast.error('Data entity didn t send to push_uri service');
      }
      setTimeout(() => {
         window.location.href = '/provideDataPush';
        }, 3000);
    } catch (error) {
      console.error('Error saving data: ', error);
     
    } finally {
      setIsLoading(false);
    }
  }

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files ? event.target.files[0] : null;
    if (file && data) {
      const fileName = file.name;
      const fileSize = file.size;
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64String = reader.result as string;
        const base64Data = base64String.replace(/^data:.+;base64,/, 'data:text/plain;base64,');
        setData({
          ...data,
          message: base64Data,
          fileName: fileName,
          fileSize: fileSize
        });
      };
      reader.onerror = (error) => {
        console.error('Error: ', error);
      };
    }
  };

  const handleChange = (name: keyof Data_send, value: string) => {
    setData(prevData => {
      
        return {
          ...prevData,
          [name]: value
        };
    });
  };

  const handleOpenModal = (modalName: string) => {
    setModalStates({ ...modalStates, [modalName]: true });
  };

  const handleCloseModal = (modalName: string) => {
    setModalStates({ ...modalStates, [modalName]: false });
  };


  const handleModalDataChange = (modalName: string, value: string) => {
    if (data) {
      setData({
        ...data,
        data_catalog_data_offerings_id: value,
      });
    }
    axiosWithInterceptorInstance.get(`/dataset/my_offered_services/${value}`)
      .then(response => {
        console.log("elenco servizi tra cui scegliere ")  // qui devo prendere il push_uri
        console.log(response);
        setCardElements(prevState => ({
          ...prevState,
          title: response.data.data_catalog_data_offerings_obj.title,
          profileFormat: response.data.data_catalog_data_offerings_obj.profile_selector,
          profileDescription: response.data.data_catalog_data_offerings_obj.profile_description,
          businnesObjectCode: response.data.data_catalog_data_offerings_obj.data_catalog_business_object_obj.code,
          businnesObjectName: response.data.data_catalog_data_offerings_obj.data_catalog_business_object_obj.name,
          serviceCode: response.data.data_catalog_data_offerings_obj.data_catalog_business_object_obj.data_catalog_service_obj.code,
          serviceName: response.data.data_catalog_data_offerings_obj.data_catalog_business_object_obj.data_catalog_service_obj.name,
          categoryCode: response.data.data_catalog_data_offerings_obj.data_catalog_business_object_obj.data_catalog_service_obj.data_catalog_category_obj.code,
          categoryName: response.data.data_catalog_data_offerings_obj.data_catalog_business_object_obj.data_catalog_service_obj.data_catalog_category_obj.name,
          push_uri:response.data.data_catalog_data_offerings_obj.push_uri
        }));
      })
      .catch(error => {
        console.error('Error fetching media:', error);
      });
  };

  return (
    <Container fluid>
      <div className='row' style={{ paddingBottom: "15px" }}>
        <div className='col-7'>
          <h2> <b><i className="fas fa-cloud-upload-alt nav-icon" style={{ paddingRight: "8px" }}></i>  Data Entity</b></h2>
          <h5> Provide new Data</h5>

        </div>
        <div className='col'>
          <div className="d-grid gap-2 d-md-flex justify-content-md-end">
            <div className="d-grid gap-2 d-md-block">

              {!isLoading && <button className="btn btn-primary" onClick={() => saveRequest()}>
                Save
              </button>}

              {isLoading && <button className="btn btn-primary" onClick={() => saveRequest()} disabled>
                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                Uploading...

              </button>}

            </div>
          </div>
        </div>
      </div>

      <Card >
        <h3 className="list-group-item-heading" style={{ paddingLeft: "20px", paddingTop: "20px" }}><b>Basic information</b></h3>
        <ListGroup variant="flush">
          <ListGroup.Item><Label for="id">ID</Label>
            <Input type="text" name="id" id="id" aria-label="Disabled input example"
              readOnly /></ListGroup.Item>

          <ListGroup.Item><Label for="title">Title *</Label>
            <Input type="text" name="title" id="title" value={data?.title} onChange={(e) => handleChange('title', e.target.value)} required
            /></ListGroup.Item>
          <ListGroup.Item><Label for="id">Description  </Label>
            <Input type="text" name="description" id="description" value={data?.description} onChange={(e) => handleChange('description', e.target.value)}
            /></ListGroup.Item>

          <ListGroup.Item><Label for="title">File *</Label>
            <Input type="file" name="title" id="title" onChange={handleFileChange}
            />
          </ListGroup.Item>
        </ListGroup>
      </Card>
      <Card >
        <h3 className="list-group-item-heading" style={{ paddingLeft: "20px", paddingTop: "20px" }}><b>Assigned To Data Offering *</b></h3>
        <ListGroup variant="flush">

          <ListGroup.Item>
            <button onClick={() => handleOpenModal('DataOfferingModal')} className="btn btn-outline-secondary" type="button" id="button-addon1" value="pippo">
              <i className="fas fa-search"></i>
              Data Offering: {!cardElements.title && "Please select one option"}{cardElements.title}
            </button>
          </ListGroup.Item>
          <ListGroup.Item><Label for="title">Title</Label>
            <Input type="text" name="title" id="title" aria-label="Disabled input example" value={cardElements.title}
              readOnly /></ListGroup.Item>
          <ListGroup.Item><Label for="id">Profile Format</Label>
            <Input type="text" name="id" id="id" aria-label="Disabled input example" value={cardElements.profileFormat}
              readOnly /></ListGroup.Item>
          <ListGroup.Item><Label for="id">Profile Description</Label>
            <Input type="text" name="id" id="id" aria-label="Disabled input example" value={cardElements.profileDescription}
              readOnly /></ListGroup.Item>


        </ListGroup>

        <div className='row' >
          <div className='col' >
            <ListGroup.Item style={{ border: 'none', boxShadow: 'none' }} ><Label for="title">Business Object Code</Label>
              <Form.Control
                type="text"
                value={cardElements.businnesObjectCode}
                aria-label="Disabled input example"
                readOnly
              /></ListGroup.Item>
          </div>
          <div className='col'>
            <ListGroup.Item style={{ border: 'none', boxShadow: 'none' }}><Label for="title">Business Object Name</Label>
              <Form.Control
                type="text"
                aria-label="Disabled input example"
                readOnly
                value={cardElements.businnesObjectName}
              /></ListGroup.Item>
          </div>
        </div>
        <div className='row' >
          <div className='col' >
            <ListGroup.Item style={{ border: 'none', boxShadow: 'none' }} ><Label for="title">Service Code</Label>
              <Form.Control
                type="text"
                aria-label="Disabled input example"
                readOnly
                value={cardElements.serviceCode}
              /></ListGroup.Item>
          </div>
          <div className='col'>
            <ListGroup.Item style={{ border: 'none', boxShadow: 'none' }}><Label for="title">Service Name</Label>
              <Form.Control
                type="text"
                aria-label="Disabled input example"
                readOnly
                value={cardElements.serviceName}
              /></ListGroup.Item>
          </div>
        </div>
        <div className='row' >
          <div className='col' >
            <ListGroup.Item style={{ border: 'none', boxShadow: 'none' }} ><Label for="title">Category Code</Label>
              <Form.Control
                type="text"
                aria-label="Disabled input example"
                readOnly
                value={cardElements.categoryCode}
              /></ListGroup.Item>
          </div>
          <div className='col'>
            <ListGroup.Item style={{ border: 'none', boxShadow: 'none' }}><Label for="title">Category Name</Label>
              <Form.Control
                type="text"
                aria-label="Disabled input example"
                readOnly
                value={cardElements.categoryName}
              /></ListGroup.Item>
          </div>
        </div>


      </Card>


      {modalStates.DataOfferingModal && (
        <ServicePush
          show={modalStates.DataOfferingModal}
          handleClose={() => handleCloseModal('DataOfferingModal')}
          onModalDataChange={handleModalDataChange}
        />
      )}


    </Container>
  );
};

export default CreateDataEntityPush;

