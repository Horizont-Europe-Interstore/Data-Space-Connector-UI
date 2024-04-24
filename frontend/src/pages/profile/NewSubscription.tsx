import axios from 'axios';
import { format } from 'date-fns';
import { Container, Row, Col, Button, FormGroup, Label, Input } from 'reactstrap';
import Card from 'react-bootstrap/Card';
import ListGroup from 'react-bootstrap/ListGroup';
import Form from 'react-bootstrap/Form';
import Dropdown from 'react-bootstrap/Dropdown';
import { useLocation } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import Offering from '../modals/Offering_NewSubscription';

////Receiving interface
interface Company {
    name: string;
    id: string;
}

interface User {
    id: string;
    username: string;
    company_obj: Company;
}

interface Data_catalog_category {
    code: string;
    name: string;
}


interface Data_catalog_service {
    code: string;
    name: string;
    data_catalog_category_obj: Data_catalog_category;
}


interface Data_catalog_business_object {
    data_catalog_service_obj: Data_catalog_service;
    name: string;
    code: string;
}

interface User_1_1 {
    id: string;
    username: string;
}

interface Data_catalog_data_offerings {
    id: string;
    title: string;
    data_catalog_business_object_obj: Data_catalog_business_object;
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
    user_1_1_obj: User_1_1;
    user_obj: User;
    comments: string;
}


interface ApiReceiving {
    data_catalog_data_offerings_obj: Data_catalog_data_offerings;
}

interface DataCatalogDataRequest {
    comments: string;
    id: string | null;
    data_catalog_data_offering_id: string;
    status: string;
}
interface RequestBody {
    data_catalog_data_requests: DataCatalogDataRequest;
}

const body: RequestBody = {
    data_catalog_data_requests: {
        comments: "",
        id: null,
        data_catalog_data_offering_id: "",
        status: "pending"
    }
};

const NewSubscription = () => {
    const [data, setData] = useState<Data_catalog_data_offerings | null>(null);
    const handleChange = (name: keyof DataCatalogDataRequest, value: string) => {
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

    const [modalStates, setModalStates] = useState({
        offeringModal: false,
    });

    const [ValuesFromModals, setFilterValuesFromModals] = useState({
        Modal_id: "",
    });

    const handleOpenModal = (modalName: string) => {
        setModalStates({ ...modalStates, [modalName]: true });
    };

    const handleCloseModal = (modalName: string) => {
        setModalStates({ ...modalStates, [modalName]: false });
    };


    const handleModalDataChange = (modalName: string, value: string) => {
        setFilterValuesFromModals({ ...ValuesFromModals, [modalName]: value });
        axios.get<ApiReceiving>(`/dataset/my_offered_services/${value}`)
            .then(response => {
                setData(response.data.data_catalog_data_offerings_obj);
            })
            .catch(error => {
                console.error('Error fetching media:', error);
            });

    };

    useEffect(() => {

    }, [ValuesFromModals.Modal_id, modalStates.offeringModal]);

    async function saveRequest() {
        if (data?.id) {
            body.data_catalog_data_requests.data_catalog_data_offering_id = data?.id;
        }

        if (data?.comments) {
            body.data_catalog_data_requests.comments = data?.comments;
        }



        try {
            const response = await axios.post('/dataset/my_subscriptions', body);
            window.location.href = '/mySubscriptions'
        } catch (error) {
            console.error('Error saving data: ', error);
        }
    }

    return (
        <Container fluid>

            <div className='row' style={{ paddingBottom: "15px" }}>
                <div className='col-7'>
                    <h2> <b><i className="fas fa-newspaper nav-icon " style={{ paddingRight: "8px" }}></i>  My Subscriptions</b></h2>
                    <h5>Create a new Subscription to an Offering</h5>
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
                <ListGroup variant="flush">
                    <ListGroup.Item>
                        <h3 style={{ paddingTop: "10px" }}><b> <i className="fas fa-external-link-alt nav-icon" style={{ paddingRight: "8px" }}> </i> Offered Services </b></h3>
                        <h6>Select Offered Service For This Subscription Request </h6>
                        <Row form>
                            <Col md={6}>
                                <FormGroup>

                                    <div className="input-group mb-3">
                                        <button onClick={() => handleOpenModal('offeringModal')} className="btn btn-outline-secondary" type="button" id="button-addon1">
                                            <i className="fas fa-search"></i>
                                            Select offering: {data?.title}
                                        </button>

                                    </div>
                                </FormGroup>
                            </Col>
                            <Col md={6}>
                                <FormGroup>

                                    <Label for="serviceName">Created on</Label>
                                    {data?.created_on && <Form.Control
                                        type="text"
                                        value={format(new Date(data?.created_on), 'dd/MM/yyyy HH:mm')}
                                        aria-label="Disabled input example"
                                        readOnly
                                    />}
                                    {!data?.created_on && <Form.Control
                                        type="text"
                                        value=""
                                        aria-label="Disabled input example"
                                        readOnly
                                    />}
                                </FormGroup>
                            </Col>
                        </Row>

                        <Row form>
                            <Col md={6}>
                                <FormGroup>
                                    <Label for="serviceCode">Businnes object code</Label>
                                    <Form.Control
                                        type="text"
                                        value={data?.data_catalog_business_object_obj.code}
                                        aria-label="Disabled input example"
                                        readOnly
                                    />
                                </FormGroup>
                            </Col>
                            <Col md={6}>
                                <FormGroup>

                                    <Label for="serviceName">Business Object Name</Label>
                                    <Form.Control
                                        type="text"
                                        value={data?.data_catalog_business_object_obj.name}
                                        aria-label="Disabled input example"
                                        readOnly
                                    />
                                </FormGroup>
                            </Col>
                        </Row>

                        <Row form>
                            <Col md={6}>
                                <FormGroup>
                                    <Label for="serviceCode">Service Code</Label>
                                    <Form.Control
                                        type="text"
                                        value={data?.data_catalog_business_object_obj.data_catalog_service_obj.code}
                                        aria-label="Disabled input example"
                                        readOnly
                                    />
                                </FormGroup>
                            </Col>
                            <Col md={6}>
                                <FormGroup>

                                    <Label for="serviceName">Service Name</Label>
                                    <Form.Control
                                        type="text"
                                        value={data?.data_catalog_business_object_obj.data_catalog_service_obj.name}
                                        aria-label="Disabled input example"
                                        readOnly
                                    />
                                </FormGroup>
                            </Col>
                        </Row>

                        <Row form>
                            <Col md={6}>
                                <FormGroup>
                                    <Label for="serviceCode">Category Code</Label>
                                    <Form.Control
                                        type="text"
                                        value={data?.data_catalog_business_object_obj.data_catalog_service_obj.data_catalog_category_obj.code}
                                        aria-label="Disabled input example"
                                        readOnly
                                    />
                                </FormGroup>
                            </Col>
                            <Col md={6}>
                                <FormGroup>

                                    <Label for="serviceName">Category Name</Label>
                                    <Form.Control
                                        type="text"
                                        value={data?.data_catalog_business_object_obj.data_catalog_service_obj.data_catalog_category_obj.name}
                                        aria-label="Disabled input example"
                                        readOnly
                                    />
                                </FormGroup>
                            </Col>
                        </Row>
                        <Row form>
                            <Col md={6}>
                                <FormGroup>
                                    <Label for="serviceCode">Offering User Id</Label>
                                    <Form.Control
                                        type="text"
                                        value={data?.user_1_1_obj.id}
                                        aria-label="Disabled input example"
                                        readOnly
                                    />
                                </FormGroup>
                            </Col>
                            <Col md={6}>
                                <FormGroup>

                                    <Label for="serviceName">Offering Username</Label>
                                    <Form.Control
                                        type="text"
                                        value={data?.user_1_1_obj.username}
                                        aria-label="Disabled input example"
                                        readOnly
                                    />
                                </FormGroup>
                            </Col>
                        </Row>

                        <Row form>
                            <Col md={6}>
                                <FormGroup>
                                    <Label for="serviceCode">Offering Company Id</Label>
                                    <Form.Control
                                        type="text"
                                        value={data?.user_obj.company_obj.id}
                                        aria-label="Disabled input example"
                                        readOnly
                                    />
                                </FormGroup>
                            </Col>
                            <Col md={6}>
                                <FormGroup>

                                    <Label for="serviceName">Offering Company Name</Label>
                                    <Form.Control
                                        type="text"
                                        value={data?.user_obj.company_obj.name}
                                        aria-label="Disabled input example"
                                        readOnly
                                    />
                                </FormGroup>
                            </Col>
                        </Row>
                    </ListGroup.Item>
                </ListGroup>
            </Card>




            <Card >
                <h3 className="list-group-item-heading" style={{ paddingLeft: "20px", paddingTop: "20px" }}><b>Comments</b></h3>
                <h6 style={{ paddingLeft: " 20px" }}>Write comments for service provider</h6>
                <ListGroup variant="flush">

                    <ListGroup.Item><Label for="id" >Comments</Label>

                        {data && <Form.Control
                            type="text"
                            value={data?.comments}
                            aria-label="Disabled input example"
                            onChange={(e) => handleChange('comments', e.target.value)}
                        />}
                        {!data && <Form.Control
                            type="text"
                            placeholder="Please select offering "
                            aria-label="Disabled input example"
                            onChange={(e) => handleChange('comments', e.target.value)}
                        />}
                    </ListGroup.Item>




                </ListGroup>
            </Card>
            {modalStates.offeringModal && (
                <Offering
                    show={modalStates.offeringModal}
                    handleClose={() => handleCloseModal('offeringModal')}
                    onModalDataChange={handleModalDataChange}
                />
            )}
        </Container>
    );
};

export default NewSubscription;

