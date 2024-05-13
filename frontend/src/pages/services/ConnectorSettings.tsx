import axios, { AxiosError } from 'axios';
import { Container, Row, Col, Button, FormGroup, Label, Input } from 'reactstrap';
import Card from 'react-bootstrap/Card';
import ListGroup from 'react-bootstrap/ListGroup';
import Form from 'react-bootstrap/Form';
import { useLocation } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import axiosWithInterceptorInstance from '@app/components/helpers/AxiosConfig';

interface ApiResponse {
    ecc_url: string;
    id: string;
    email: string;
    username: string;
    name: string;
    broker_url: string;
    ed_api_url: string;
    data_app_url: string;
}

const ConnectorSettings = () => {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const id = queryParams.get('id');
    const [data, setData] = useState<ApiResponse>({} as ApiResponse);

    useEffect(() => {
        axiosWithInterceptorInstance.get<ApiResponse[]>(`/custom-query/data-objects/?id=e48046c9-0b94-41d2-9ad4-206f1604b821`)
            .then(response => {
                setData(response.data[0]);
            })
            .catch(error => {
                console.error('Error fetching data:', error);
            });
    }, []);

    const handleChange = (name: string, value: string) => {

        setData(prevData => ({
            ...prevData,
            [name]: value
        }));
    };

    async function saveRequest() {
        let apI = `/custom-query/data?id=74c9e3bc-4e26-4d74-aefb-a5ab4b364c1e&ed_api_url=${data?.ed_api_url}&data_app_url=${data?.data_app_url}&ecc_url=${data?.ecc_url}&broker_url=${data?.broker_url}`


        try {
            const response = axiosWithInterceptorInstance.post(apI);
            
            if ((await response).status === 200) {
                toast.success('saved successfully!');
            }
        } catch (error:any) {
            toast.error("Error" + error)
            console.error('Error saving data: ', error);
        }
    }
    return (
        <Container fluid>

            <div className='row' style={{ paddingBottom: "15px" }}>
                <div className='col-11'>
                    <h2> <i className="fas fa-cogs nav-icon" style={{ paddingRight: "8px" }}></i><b>Connector settings</b></h2>
                    <h5>Edit Connector Settings</h5>
                </div>

                <div className='col' >
                    <button className="btn btn-primary" onClick={() => saveRequest()} data-toggle="tooltip" data-placement="top" title="Save your new configuration">
                        Save
                    </button>
                </div>

            </div>
            <Card  >
                <h3 className="list-group-item-heading" style={{ padding: "10px 20px" }}><b><i className="fas fa-user" style={{ paddingRight: "8px" }}></i>User information</b></h3>
                <ListGroup variant="flush">
                    <ListGroup.Item>
                        <FormGroup>
                            <Label for="serviceCode">Id</Label>
                            <Form.Control
                                type="text"
                                value={data?.id}
                                aria-label="Disabled input example"
                                readOnly
                            />
                        </FormGroup>
                        <FormGroup>
                            <Label for="serviceCode">Email</Label>
                            <Form.Control
                                type="text"
                                value={data?.email}
                                aria-label="Disabled input example"
                                readOnly
                            />
                        </FormGroup>
                        <FormGroup>
                            <Label for="serviceCode">Username</Label>
                            <Form.Control
                                type="text"
                                value={data?.username}
                                aria-label="Disabled input example"
                                readOnly
                            />
                        </FormGroup>
                        <FormGroup>
                            <Label for="serviceCode">Company</Label>
                            <Form.Control
                                type="text"
                                value={data?.name}
                                aria-label="Disabled input example"
                                readOnly
                            />
                        </FormGroup>
                    </ListGroup.Item>
                </ListGroup>
            </Card>

            <Card >
                <h3 className="list-group-item-heading" style={{ padding: "10px 20px" }}> <i className="fas fa-desktop" style={{ paddingRight: "8px" }}></i> <b>Local Applications</b></h3>
                <h6 className="list-group-item-heading" style={{ paddingLeft: " 20px" }}>True Connector Provider, Consumer & The Local Api Must Be Installed On Your Premises By Your Network Administrator</h6>
                <ListGroup variant="flush">

                    <ListGroup.Item><Label for="id" >Local Api Url</Label>
                        <div className="row">
                            <div className="col">
                                <Form.Control
                                    type="text"
                                    value={data?.ed_api_url}
                                    onChange={(e) => handleChange('ed_api_url', e.target.value)}
                                />
                            </div>
                        </div>
                        <Label for="id" style={{ paddingTop: " 18px" }} >Data app</Label>
                        <div className="row" >

                            <div className="col">
                                <Form.Control
                                    type="text"
                                    value={data?.data_app_url}
                                    onChange={(e) => handleChange('data_app_url', e.target.value)}
                                />
                            </div>
                        </div>
                        <Label for="id" style={{ paddingTop: " 18px" }} >Ecc Url</Label>
                        <div className="row" >

                            <div className="col">
                                <Form.Control
                                    type="text"
                                    value={data?.ecc_url}
                                    onChange={(e) => handleChange('ecc_url', e.target.value)}
                                />
                            </div>
                        </div>
                        {/*  <Label for="id" style={{ paddingTop: " 18px" }} >Broker url</Label> */}
                        <div className="row" >

                            {/*   <div className="col">
                                <Form.Control
                                    type="text"
                                    value={data?.broker_url}
                                    onChange={(e) => handleChange('broker_url', e.target.value)}
                                />
                            </div> */}
                        </div>
                    </ListGroup.Item>
                </ListGroup>
            </Card>
        </Container>
    );
};

export default ConnectorSettings;

