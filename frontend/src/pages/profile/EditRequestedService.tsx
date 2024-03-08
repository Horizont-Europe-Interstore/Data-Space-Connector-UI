import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Row, Col, Button, FormGroup, Label, Input } from 'reactstrap';
import Card from 'react-bootstrap/Card';
import ListGroup from 'react-bootstrap/ListGroup';
import Form from 'react-bootstrap/Form';
import Dropdown from 'react-bootstrap/Dropdown';
import { useLocation } from 'react-router-dom';
import { format } from 'date-fns';
interface DataCatalogCategory {
    code: string;
    name: string;
    id: string;
    short_order: string;
    modified_on: string;
    address: string;
    created_on: string;
    phone: string;
    modified_by: string;
    description: string;
    created_by: string;
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
interface Data_catalog_business_object{
    code:string;
    name:string; 
    data_catalog_service: DataCatalogService;
}

interface Data_catalog_data_offerings {
    file_schema_filename: string;
    file_schema: string;
    code: string;
    profile_description: string;
    file_schema_sample_filename: string;
    short_order: string;
    data_catalog_service_id: string;
    file_schema_sample: string;
    profile_selector: string;
    name: string;
    id: string;
title:string;
   
    data_catalog_business_object: Data_catalog_business_object;
}

interface DataCatalogDataRequests {
    title: string;
    modified_on: string;
    comments: string;
    input_data_source: string;
    input_profile: string;
    owner_id: string;
    user_requesting: {
        id: string;
        username: string;
        company_requesting: {
            name: string;

        }
    };
    created_by: string;
    viewed_by_offering_owner: string;
    data_catalog_business_object_id: string;
    created_on: string;
    data_catalog_data_offerings: Data_catalog_data_offerings;
    modified_by: string;
    id: string;
    data_catalog_data_offering_id: string;
    user: {
        id: string;
        email: string;
        username: string;



    };
    status: string;
}

interface ApiResponse {
    data_catalog_data_requests: DataCatalogDataRequests;
}

interface DataCatalogDataRequest {
    id: string;
    status: string;
}
interface RequestBody {
    data_catalog_data_requests: DataCatalogDataRequest;
}

const body: RequestBody = {
    data_catalog_data_requests: {

        id: "",

        status: "",
    }
};

const DetailService = () => {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const id = queryParams.get('id');
    const [data, setData] = useState<DataCatalogDataRequests | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get<ApiResponse>(`/dataset/requests_on_offered_services/${id}`);
                setData(response.data.data_catalog_data_requests);
            } catch (error) {
                console.error('Error fetching data: ', error);
            }
        };

        fetchData();
    }, []);

    if (!data) {
        return <div>Caricamento in corso...</div>;
    }



    function acceptRequest() {
        if (data) {
            setData({ ...data, status: "accept" });

        }
    }
    function rejectRequest() {
        if (data) {
            setData({ ...data, status: "reject" });

        }

    }

    async function saveRequest() {
        if (data?.id) {
            body.data_catalog_data_requests.id = data.id;
        }

        if (data?.status) {
            body.data_catalog_data_requests.status = data.status;
        }



        try {
            const response = await axios.post('/dataset/requests_on_offered_services', body);
            window.location.href = '/requests'
        } catch (error) {
            console.error('Error saving data: ', error);
        }
    }


    return (

        <Container fluid>

            <div className='row' style={{ paddingBottom: "15px" }}>
                <div className='col-7'>
                    <h2> <b><i className="fas fa-paper-plane nav-icon" style={{ paddingRight: "8px" }}></i>  Request </b></h2>
                    <h5>Accept <i className="fas fa-solid fa-check nav-icon" ></i> or Reject <i className="fas fa-times nav-icon"></i></h5>

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

                <h3 className="list-group-item-heading" style={{ paddingLeft: "20px", paddingTop: "20px" }}><b>Offering & Subscription Request Details</b></h3>
                <h6 style={{ paddingLeft: " 20px" }}>Check Your  Offering And The  Subscription Request Info &  Accept <i className="fas fa-solid fa-check nav-icon" ></i> Or Reject<i className="fas fa-times nav-icon"></i> The Request</h6>
                <div className=' row d-flex justify-content-between align-items-center' >
                </div>
                <ListGroup variant="flush" >
                    <div className='row align-items-center d-flex' >
                        <div className='col-9 ' >
                            <ListGroup.Item style={{ border: 'none', boxShadow: 'none' }}><Label for="Code">Status </Label>
                                <Form.Control
                                    type="text"
                                    placeholder={data.status}
                                    aria-label="Disabled input example"
                                    readOnly
                                />
                            </ListGroup.Item>
                        </div>
                        <div className='col' style={{ paddingTop: " 20px", paddingLeft: "46px" }}>
                            <button className="btn btn-success" onClick={() => acceptRequest()}>
                                Accept <i className="fas fa-solid fa-check nav-icon" ></i>
                            </button>
                        </div>
                        <div className='col' style={{ paddingTop: " 20px" }}>
                            <button className="btn btn-danger" onClick={() => rejectRequest()}>
                                Reject <i className="fas fa-times nav-icon"></i>
                            </button>
                        </div>
                    </div>
                    <div className='row' >
                        <div className='col' >
                            <ListGroup.Item style={{ border: 'none', boxShadow: 'none' }} ><Label for="title">Requesting User Id</Label>
                                <Form.Control
                                    type="text"
                                    placeholder={data.user_requesting.id}
                                    aria-label="Disabled input example"
                                    readOnly
                                /></ListGroup.Item>
                        </div>
                        <div className='col'>
                            <ListGroup.Item style={{ border: 'none', boxShadow: 'none' }}><Label for="title">Requesting User</Label>
                                <Form.Control
                                    type="text"
                                    placeholder={data.user_requesting.username}
                                    aria-label="Disabled input example"
                                    readOnly
                                /></ListGroup.Item>
                        </div>
                        <div className='col'>
                            <ListGroup.Item style={{ border: 'none', boxShadow: 'none' }}><Label for="title">Requesting Company</Label>
                                <Form.Control
                                    type="text"
                                    placeholder={data.user_requesting.company_requesting.name}
                                    aria-label="Disabled input example"
                                    readOnly
                                /></ListGroup.Item>
                        </div>
                    </div>



                    <div className='row' >
                        <div className='col' >
                            <ListGroup.Item style={{ border: 'none', boxShadow: 'none' }} ><Label for="title">Your offering Id</Label>
                                <Form.Control
                                    type="text"
                                    placeholder={data.data_catalog_data_offerings.id}
                                    aria-label="Disabled input example"
                                    readOnly
                                /></ListGroup.Item>
                        </div>
                        <div className='col'>
                            <ListGroup.Item style={{ border: 'none', boxShadow: 'none' }}><Label for="title">Created on</Label>
                                <Form.Control
                                    type="text"
                                    placeholder={format(new Date(data.created_on), 'dd/MM/yyyy HH:mm')}
                                    aria-label="Disabled input example"
                                    readOnly
                                /></ListGroup.Item>
                        </div>
                    </div>
                    <ListGroup.Item style={{ border: 'none', boxShadow: 'none' }}><Label for="title">Title</Label>
                        <Form.Control
                            type="text"
                            placeholder={data.data_catalog_data_offerings.title}
                            aria-label="Disabled input example"
                            readOnly
                        /></ListGroup.Item>

                    <div className='row' >
                        <div className='col' >
                            <ListGroup.Item style={{ border: 'none', boxShadow: 'none' }} ><Label for="title">Business Object Code</Label>
                                <Form.Control
                                    type="text"
                                    placeholder={data.data_catalog_data_offerings.data_catalog_business_object.code}
                                    aria-label="Disabled input example"
                                    readOnly
                                /></ListGroup.Item>
                        </div>
                        <div className='col'>
                            <ListGroup.Item style={{ border: 'none', boxShadow: 'none' }}><Label for="title">Business Object Name</Label>
                                <Form.Control
                                    type="text"
                                    placeholder={data.data_catalog_data_offerings.data_catalog_business_object.name}
                                    aria-label="Disabled input example"
                                    readOnly
                                /></ListGroup.Item>
                        </div>
                    </div>
                    <div className='row' >
                        <div className='col' >
                            <ListGroup.Item style={{ border: 'none', boxShadow: 'none' }} ><Label for="title">Service Code</Label>
                                <Form.Control
                                    type="text"
                                    placeholder={data.data_catalog_data_offerings.data_catalog_business_object.data_catalog_service.code}
                                    aria-label="Disabled input example"
                                    readOnly
                                /></ListGroup.Item>
                        </div>
                        <div className='col'>
                            <ListGroup.Item style={{ border: 'none', boxShadow: 'none' }}><Label for="title">Service Name</Label>
                                <Form.Control
                                    type="text"
                                    placeholder={data.data_catalog_data_offerings.data_catalog_business_object.data_catalog_service.name}
                                    aria-label="Disabled input example"
                                    readOnly
                                /></ListGroup.Item>
                        </div>
                    </div>
                    <div className='row' >
                        <div className='col' >
                            <ListGroup.Item style={{ border: 'none', boxShadow: 'none' }} ><Label for="title">Category Code</Label>
                                <Form.Control
                                    type="text"
                                    placeholder={data.data_catalog_data_offerings.data_catalog_business_object.data_catalog_service.data_catalog_category.code}
                                    aria-label="Disabled input example"
                                    readOnly
                                /></ListGroup.Item>
                        </div>
                        <div className='col'>
                            <ListGroup.Item style={{ border: 'none', boxShadow: 'none' }}><Label for="title">Category Name</Label>
                                <Form.Control
                                    type="text"
                                    placeholder={data.data_catalog_data_offerings.data_catalog_business_object.data_catalog_service.data_catalog_category.name}
                                    aria-label="Disabled input example"
                                    readOnly
                                /></ListGroup.Item>
                        </div>
                    </div>
                </ListGroup>
            </Card>
            <Card>
                <ListGroup.Item style={{ border: 'none', boxShadow: 'none' }}>
                    <h3 className="list-group-item-heading" style={{ paddingLeft: "10px", paddingTop: "10px" }}><b>Comments</b></h3>
                    <h6 style={{ paddingLeft: " 10px" }}>Comments From The Service Applicant</h6>
                    <Form.Control
                        type="text"
                        placeholder={data.comments}
                        aria-label="Disabled input example"
                        readOnly
                    /></ListGroup.Item>
            </Card>
        </Container>
    );
};

export default DetailService;



