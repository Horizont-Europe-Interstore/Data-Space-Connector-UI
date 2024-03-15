import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Row, Col, Button, FormGroup, Label, Input } from 'reactstrap';
import Card from 'react-bootstrap/Card';
import ListGroup from 'react-bootstrap/ListGroup';
import Form from 'react-bootstrap/Form';
import Dropdown from 'react-bootstrap/Dropdown';
import { useLocation } from 'react-router-dom';


interface DataCatalogCategory {
    code: string;
    name: string;
    id: string;
    short_order: string | null;
}

interface DataCatalogService {
    short_description: string;
    data_catalog_category_id: string;
    code: string;
    name: string;
    id: string;
    short_order: string | null;
    data_catalog_category_obj: DataCatalogCategory; // Corrected to match your JSON structure
}

interface DataCatalogBusinessObject {
    file_schema_filename: string;
    file_schema: string;
    code: string;
    profile_description: string;
    file_schema_sample_filename: string;
    short_order: string | null;
    data_catalog_service_id: string;
    file_schema_sample: string;
    profile_selector: string;
    name: string;
    id: string;
    status: string;
    data_catalog_service_obj: DataCatalogService; // Corrected to match your JSON structure
}

interface ApiResponse {
    data_catalog_business_object_obj: DataCatalogBusinessObject;
}


const DetailService = () => {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const id = queryParams.get('id');
    const [data, setData] = useState<DataCatalogBusinessObject | null>(null);
    const [isLoading1, setIsLoading1] = useState(false);
    const [isLoading2, setIsLoading2] = useState(false);
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get<ApiResponse>(`/dataset/cross_platform_service/${id}`);
                setData(response.data.data_catalog_business_object_obj);
            } catch (error) {
                console.error('Error fetching data: ', error);
            }
        };

        fetchData();
    }, []);
    if (!data) {
        return <div>Caricamento in corso...</div>;
    }

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
            <h1 style={{ paddingBottom: "15px" }}> <i className="fas fa-server nav-icon" style={{ paddingRight: "8px" }}> </i> <b>Cross Platform Service</b></h1>
            <Card >
                <h3 className="list-group-item-heading" style={{ paddingLeft: "20px", paddingTop: "20px" }}> <b>Basic information</b></h3>
                <h5 style={{ paddingLeft: "20px" }}>Fill Business Object Basic Information</h5>
                <ListGroup variant="flush">
                    <ListGroup.Item><Label for="Code">Code </Label>
                        <Form.Control
                            type="text"
                            value={data.code}
                            aria-label="Disabled input example"
                            readOnly
                        />

                    </ListGroup.Item>
                    <ListGroup.Item><Label for="title">Name</Label>
                        <Form.Control
                            type="text"
                            value={data.name}
                            aria-label="Disabled input example"
                            readOnly
                        /></ListGroup.Item>
                </ListGroup>
            </Card>
            <Card >
                <h3 className="list-group-item-heading" style={{ paddingLeft: "20px", paddingTop: "20px" }}><b>Service</b></h3>
                <h5 style={{ paddingLeft: "20px" }}>Select service</h5>
                <ListGroup variant="flush">
                    <ListGroup.Item><Label for="id">Select service</Label>
                        <Form.Control
                            type="text"
                            value={data.data_catalog_service_obj.code}
                            aria-label="Disabled input example"
                            readOnly
                        />
                    </ListGroup.Item>
                    <ListGroup.Item><Label for="id">Service Name</Label>
                        <Form.Control
                            type="text"
                            value={data.data_catalog_service_obj.name}
                            aria-label="Disabled input example"
                            readOnly
                        />
                    </ListGroup.Item>
                    <ListGroup.Item><Label for="id">Service Short Description</Label>
                        <Form.Control
                            type="text"
                            value={data.data_catalog_service_obj.short_description}
                            aria-label="Disabled input example"
                            readOnly
                        />
                    </ListGroup.Item>
                    <ListGroup.Item><Label for="id">Category Code</Label>
                        <Form.Control
                            type="text"
                            value={data.data_catalog_service_obj.data_catalog_category_obj.code}
                            aria-label="Disabled input example"
                            readOnly
                        />
                    </ListGroup.Item>
                    <ListGroup.Item><Label for="id">Category Name</Label>
                        <Form.Control
                            type="text"
                            value={data.data_catalog_service_obj.data_catalog_category_obj.name}
                            aria-label="Disabled input example"
                            readOnly
                        />
                    </ListGroup.Item>

                </ListGroup>
            </Card>
            <Card >
                <h3 className="list-group-item-heading" style={{ paddingLeft: "20px", paddingTop: "20px" }}> <b>Semantic Definition</b></h3>
                <ListGroup variant="flush">
                    <ListGroup.Item><Label for="id">File Schema</Label>

                        <div className='row d-flex flex-nowrap'>

                            <div className='col'>
                                <Form.Control
                                    type="text"
                                    value={data.file_schema_filename}
                                    aria-label="Disabled input example"
                                    readOnly
                                />
                            </div>
                            {data.file_schema && <div className='col-2'>
                                {!isLoading1 && <button className="btn btn-primary" onClick={() => downloadFile("file_schema", "file_schema_filename")}>
                                    Download
                                </button>}

                                {isLoading1 && <button className="btn btn-primary" onClick={() => downloadFile("file_schema", "file_schema_filename")}>
                                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                    Downloading...
                                </button>}
                                
                            </div>}

                            {!data.file_schema && <div className='col-2'>
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
                    <ListGroup.Item><Label for="id">File Schema Sample </Label>
                        <div className='row d-flex flex-nowrap'>
                            <div className='col'>
                                <Form.Control
                                    type="text"
                                    value={data.file_schema_sample_filename}
                                    aria-label="Disabled input example"
                                    readOnly
                                />
                            </div>
                           {data.file_schema_sample && <div className='col-2'>


                                {!isLoading2 && <button className="btn btn-primary" onClick={() => downloadFile("file_schema_sample", "file_schema_sample_filename")}>
                                    Download
                                </button>}

                                {isLoading2 && <button className="btn btn-primary" onClick={() => downloadFile("file_schema_sample", "file_schema_sample_filename")}>
                                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                    Downloading...
                                </button>}

                            </div>}

                            {!data.file_schema_sample && <div className='col-2'>


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
                    <ListGroup.Item><Label for="profileFormat">Profile format</Label>
                        <Form.Control
                            type="text"
                            value={data.profile_selector}
                            aria-label="Disabled input example"
                            readOnly
                        />
                    </ListGroup.Item>
                    <ListGroup.Item><Label for="id">Profile Description</Label>
                        <Form.Control
                            type="text"
                            value={data.profile_description}
                            aria-label="Disabled input example"
                            readOnly
                        />
                    </ListGroup.Item>
                </ListGroup>
            </Card>
        </Container>
    );
};

export default DetailService;

