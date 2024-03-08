import axios from 'axios';

import { Container, Row, Col, Button, FormGroup, Label, Input } from 'reactstrap';
import Card from 'react-bootstrap/Card';
import ListGroup from 'react-bootstrap/ListGroup';
import Form from 'react-bootstrap/Form';
import Dropdown from 'react-bootstrap/Dropdown';
import { useLocation } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
interface Company {
    name: string;
    id: string;
}
interface User_offering {
    company: Company;
}
interface User {
    id: string;
    username: string;
}


interface Data_catalog_category {
    code: string;
    name: string;
}

interface Data_catalog_service {
    data_catalog_category: Data_catalog_category;
}

interface Data_catalog_service {
    code: string;
    name: string;
    data_catalog_service: Data_catalog_service;
}
interface Data_catalog_business_object {
    data_catalog_service: Data_catalog_service;
    code: string;
    name: string;
}

interface Data_catalog_data_offerings {
    data_catalog_business_object: Data_catalog_business_object;
    user_offering: User_offering;
}

interface Data_catalog_data_requests {
    data_catalog_data_offering_id: string;
    created_on: string;
    data_catalog_data_offerings: Data_catalog_data_offerings;
    comments:string;
    user: User;
}

interface ApiResponse {
    data_catalog_data_requests: Data_catalog_data_requests;
}

const EditSubscription = () => {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const id = queryParams.get('id');
    const [data, setData] = useState<Data_catalog_data_requests | null>(null);
    useEffect(() => {
        axios.get<ApiResponse>(`/dataset/my_subscriptions/${id}`)
            .then(response => {
                setData(response.data.data_catalog_data_requests);
            })
            .catch(error => {
                console.error('Error fetching media:', error);
            });
    }, []);

    return (
        <Container fluid>
           <div className='row' style={{ paddingBottom: "15px" }}>
               
                    <h2> <b><i className="fas fa-newspaper nav-icon " style={{ paddingRight: "8px" }}></i>  My Subscription</b></h2>
                
               
            </div>
            <Card >
            <h3 className="list-group-item-heading" style={{ paddingLeft: "20px", paddingTop: "20px" }}><b>  <i className="fas fa-external-link-alt nav-icon" style={{ paddingRight: "8px" }}> </i> Offered Services</b></h3>
        <h6 style={{ paddingLeft: " 20px" }}>Select Offered Service For This Subscription Request</h6>
                <ListGroup variant="flush">


                    <ListGroup.Item>
                        <Row form>
                            <Col md={6}>
                                <FormGroup>
                                    <Label for="serviceCode">Select offering</Label>
                                    <Form.Control
                                        type="text"
                                        value={data?.data_catalog_data_offering_id}
                                        aria-label="Disabled input example"
                                        readOnly
                                    />
                                </FormGroup>
                            </Col>
                            <Col md={6}>
                                <FormGroup>

                                    <Label for="serviceName">Created on</Label>
                                    <Form.Control
                                        type="text"
                                        value={data?.created_on}
                                        aria-label="Disabled input example"
                                        readOnly
                                    />
                                </FormGroup>
                            </Col>
                        </Row>

                        <Row form>
                            <Col md={6}>
                                <FormGroup>
                                    <Label for="serviceCode">Businnes object code</Label>
                                    <Form.Control
                                        type="text"
                                        value={data?.data_catalog_data_offerings.data_catalog_business_object.code}
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
                                        value={data?.data_catalog_data_offerings.data_catalog_business_object.name}
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
                                        value={data?.data_catalog_data_offerings.data_catalog_business_object.data_catalog_service.code}
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
                                        value={data?.data_catalog_data_offerings.data_catalog_business_object.data_catalog_service.name}
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
                                        value={data?.data_catalog_data_offerings.data_catalog_business_object.data_catalog_service.data_catalog_category.code}
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
                                        value={data?.data_catalog_data_offerings.data_catalog_business_object.data_catalog_service.data_catalog_category.name}
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
                                        value={data?.user.id}
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
                                        value={data?.user.username}
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
                                        value={data?.data_catalog_data_offerings.user_offering.company.id}
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
                                        value={data?.data_catalog_data_offerings.user_offering.company.name}
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
                <h3 className="list-group-item-heading" style={{ padding: "10px 20px" }}>Comments</h3>
                <h6 className="list-group-item-heading" style={{ paddingLeft: " 20px" }}>Write comments for service provider</h6>
                <ListGroup variant="flush">

                    <ListGroup.Item><Label for="id" >Comments</Label>

                        <Form.Control
                            type="text"
                            value={data?.comments}
                            aria-label="Disabled input example"
                            readOnly
                        />
                    </ListGroup.Item>
                </ListGroup>
            </Card>
        </Container>
    );
};

export default EditSubscription;

