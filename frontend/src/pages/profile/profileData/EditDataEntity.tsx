import { Container, Row, Col, Button, FormGroup, Label, Input } from 'reactstrap';
import Card from 'react-bootstrap/Card';
import ListGroup from 'react-bootstrap/ListGroup';
import Form from 'react-bootstrap/Form';
import Dropdown from 'react-bootstrap/Dropdown';
import { useLocation } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import axios from 'axios';


interface Data_catalog_category {
  code: string;
  name: string;
}


interface Data_catalog_service {
  code: string;
  name: string;
  data_catalog_category: Data_catalog_category;
  short_description: string;
}


interface Data_catalog_business_object {
  data_catalog_service: Data_catalog_service;
  name: string;
  code: string;


}
interface Data_catalog_data_offerings {
  file_schema_filename: string;
  data_catalog_business_object: Data_catalog_business_object;
  title: string;
  profile_description: string;
  profile_selector: string;

}


interface Data_send {
  id: string;
  title: string;
  description: string;
  created_on: string;
  active_to: string;
  profile_selector: string;
  file_schema_sample_filename: string;
  file_schema_filename: string;
  file_schema_sample: string;
  file_schema: string;
  data_catalog_data_offerings: Data_catalog_data_offerings;
  data_catalog_data_offerings_id: string;
  fileName: string;
}

interface ApiResponse {
  data_send: Data_send;
}
const EditDataEntity = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const id = queryParams.get('id');
  const [data, setData] = useState<Data_send | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [fileBase64, setFileBase64] = useState<string>('');


  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get<ApiResponse>(`/dataset/data_provided/${id}`);
        setData(response.data.data_send);
      } catch (error) {
        console.error('Error fetching data: ', error);
      }
    };
    fetchData();
  }, []);

  return (
    <Container fluid>

      <h2> <b><i className="fas fa-cloud-upload-alt nav-icon" style={{ paddingRight: "8px" }}></i>  Data Entity</b></h2>
      <h5 style={{paddingBottom:"15px"}}> View Data</h5>
      <Card >
        <h3 className="list-group-item-heading" style={{ paddingLeft: "20px", paddingTop: "20px" }}><b>Basic information</b></h3>

        <ListGroup variant="flush">
          <ListGroup.Item><Label for="id">ID</Label>
            <Input type="text" name="id" id="id" value={data?.id} /></ListGroup.Item>
          <ListGroup.Item><Label for="title">Title</Label>
            <Input type="text" name="title" id="title" value={data?.title} /></ListGroup.Item>
          <ListGroup.Item><Label for="id">Description</Label>
            <Input type="text" name="id" id="id" value={data?.description} /></ListGroup.Item>
          <ListGroup.Item><Label for="title">File</Label>
            <Input type="text" name="title" id="title" value={data?.fileName} /></ListGroup.Item>
        </ListGroup>
      </Card>
      <Card >
        <h3 className="list-group-item-heading" style={{ paddingLeft: "20px", paddingTop: "20px" }}><b>Assigned To Data Offering</b></h3>
        <ListGroup variant="flush">
          <ListGroup.Item><Label for="id">Data Offering</Label>
            <Input type="text" name="id" id="id" value={data?.data_catalog_data_offerings_id} /></ListGroup.Item>
          <ListGroup.Item><Label for="title">Title</Label>
            <Input type="text" name="title" id="title" value={data?.data_catalog_data_offerings.title} /></ListGroup.Item>
          <ListGroup.Item><Label for="id">Profile Format</Label>
            <Input type="text" name="id" id="id" value={data?.data_catalog_data_offerings.profile_selector} /></ListGroup.Item>
          <ListGroup.Item><Label for="id">Profile Description</Label>
            <Input type="text" name="id" id="id" value={data?.data_catalog_data_offerings.profile_description} /></ListGroup.Item>
        </ListGroup>
        <div className='row' >
          <div className='col' >
            <ListGroup.Item style={{ border: 'none', boxShadow: 'none' }} ><Label for="title">Business Object Code</Label>
              <Form.Control
                type="text"
                value={data?.data_catalog_data_offerings.data_catalog_business_object.code}
              /></ListGroup.Item>
          </div>
          <div className='col'>
            <ListGroup.Item style={{ border: 'none', boxShadow: 'none' }}><Label for="title">Business Object Name</Label>
              <Form.Control
                type="text"
                value={data?.data_catalog_data_offerings.data_catalog_business_object.name}
              /></ListGroup.Item>
          </div>
        </div>
        <div className='row' >
          <div className='col' >
            <ListGroup.Item style={{ border: 'none', boxShadow: 'none' }} ><Label for="title">Service Code</Label>
              <Form.Control
                type="text"
                value={data?.data_catalog_data_offerings.data_catalog_business_object.data_catalog_service.code}
              /></ListGroup.Item>
          </div>
          <div className='col'>
            <ListGroup.Item style={{ border: 'none', boxShadow: 'none' }}><Label for="title">Service Name</Label>
              <Form.Control
                type="text"
                value={data?.data_catalog_data_offerings.data_catalog_business_object.data_catalog_service.name}
              /></ListGroup.Item>
          </div>
        </div>
        <div className='row' >
          <div className='col' >
            <ListGroup.Item style={{ border: 'none', boxShadow: 'none' }} ><Label for="title">Category Code</Label>
              <Form.Control
                type="text"
                value={data?.data_catalog_data_offerings.data_catalog_business_object.data_catalog_service.data_catalog_category.code}
              /></ListGroup.Item>
          </div>
          <div className='col'>
            <ListGroup.Item style={{ border: 'none', boxShadow: 'none' }}><Label for="title">Category Name</Label>
              <Form.Control
                type="text"
                value={data?.data_catalog_data_offerings.data_catalog_business_object.data_catalog_service.data_catalog_category.name}
              /></ListGroup.Item>
          </div>
        </div>
      </Card>
    </Container>
  );
};

export default EditDataEntity;

