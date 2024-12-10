import { Container, Label, Input } from 'reactstrap';
import Card from 'react-bootstrap/Card';
import ListGroup from 'react-bootstrap/ListGroup';
import Form from 'react-bootstrap/Form';
import { useLocation } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import axios, { AxiosError } from 'axios';
import { RetrieveLocalApi } from '@app/components/helpers/RetrieveLocalApi';
import axiosWithInterceptorInstance from '@app/components/helpers/AxiosConfig';

interface Data_catalog_category {
    code: string;
    name: string;
}


interface Data_catalog_service {
    code: string;
    name: string;
    data_catalog_category_obj: Data_catalog_category;
    short_description: string;
}


interface Data_catalog_business_object {
    data_catalog_service_obj: Data_catalog_service;
    name: string;
    code: string;


}
interface User_offering {
    ecc_url: string;
    consumer_fiware_url: string;
    data_app_url: string;
}
interface Onenet_consumer {
    broker_url: string;
    data_app_url: string;
    ecc_url: string;

}
interface Data_catalog_data_requests {
    onenet_consumer_obj: Onenet_consumer;
}
interface Data_catalog_data_offerings {
    file_schema_filename: string;
    data_catalog_business_object_obj: Data_catalog_business_object;
    title: string;
    profile_description: string;
    profile_selector: string;
    user_offering: User_offering;
    data_catalog_data_requests_obj: Data_catalog_data_requests;
    file_schema: string;
    user_offering_obj: User_offering_obj
}
interface User_offering_obj {
    ecc_url: string;
    data_app_url: string;
}
interface Provider_obj {

    ecc_url: string,
    broker_url: string,
    id: string,
    provider_fiware_url: string,
    ed_api_url: string

}

interface Data_send {
    id: string;
    title: string;
    fileName: string;
    created_on: string;
    active_to: string;
    profile_selector: string;
    filedata: string;
    data_catalog_data_offerings_obj: Data_catalog_data_offerings;
    data_catalog_data_offerings_id: string;
    description: string;
    provider_obj:Provider_obj 

}

interface ApiResponse {
    data_send_obj: Data_send;
}

/* interface ApiResponse3 {
    data_send_obj: Data_send;
} */
const EditDataEntity = () => {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const id = queryParams.get('id');
    const [data, setData] = useState<Data_send>();
    //const [data2, setData2] = useState<Data_send>();
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                //vecchia chiamata 
/*                 const response2 = await axiosWithInterceptorInstance.get<ApiResponse3>(`/dataset/data_consumed/${id}`);
                console.log("dati data_consumed");
                console.log(response2.data);
                setData2(response2.data.data_send_obj); */
                // sostituita con questa per ottenere i dati di chi ha fatto upload
                const response = await axiosWithInterceptorInstance.get<ApiResponse>(`/dataset/data_provided/${id}`);
                console.log("dati da consumare get");
                console.log(response.data.data_send_obj);
                console.log(response.data);
                setData(response.data.data_send_obj);
            } catch (error) {
                console.error('Error fetching data: ', error);
            }
        };
        fetchData();
    }, []);

    interface ApiResponse2 {
        filedata: string;
    }

    async function downloadFile(): Promise<void> {

        try {
            setIsLoading(true);
            console.log("dati scaricati")
            console.log(data?.provider_obj)
            let apiAdd: string = "";
            let apiAdd2: string = "";
            //let apiAdd3: string = "";
            console.log("dato che attingo")
            console.log(data)
            // old code
            // if (data?.data_catalog_data_offerings_obj.data_catalog_data_requests_obj.onenet_consumer_obj.ecc_url && data?.data_catalog_data_offerings_obj.data_catalog_data_requests_obj.onenet_consumer_obj.broker_url && data?.data_catalog_data_offerings_obj.data_catalog_data_requests_obj.onenet_consumer_obj.data_app_url) {

            //     apiAdd = data?.data_catalog_data_offerings_obj.user_offering_obj.ecc_url
            //     apiAdd2 = data?.data_catalog_data_offerings_obj.data_catalog_data_requests_obj.onenet_consumer_obj.broker_url
            //     apiAdd3 = data?.data_catalog_data_offerings_obj.data_catalog_data_requests_obj.onenet_consumer_obj.data_app_url
            //     console.log(apiAdd + apiAdd2 + apiAdd3 + "ooooooooo")

            // }
            if (data?.provider_obj.ecc_url) {
            
                apiAdd = data?.provider_obj.ecc_url; //"https://ecc-provider:8889/data"                
                apiAdd2 = data?.provider_obj.broker_url; //è vuoto non so a cosa serva ne come riempirlo 
                // apiAdd3 = data2?.data_catalog_data_offerings_obj.user_offering_obj.data_app_url; //"https://be-dataapp-provider:8083" 
                console.log("dati chiamanti ad apiurl")
                console.log(apiAdd )
                console.log(apiAdd2)
                //console.log(apiAdd3 )

            }

            //occhio a qule servizio chiamo qui per ottenre il dettaglio e quello che chiamo per download data_consumed
            const settingsResponse = await RetrieveLocalApi();
            const apiRetrived = settingsResponse.ed_api_url;
            const dataAppUrl = settingsResponse.data_app_url;
            console.log("ho premuto download  e questo è l'url :")
            console.log(`${apiRetrived}/entity?id=${data?.id}&provider_ecc=${btoa(apiAdd)}&consumer_fiware=${btoa(apiAdd2)}&consumer_data_app=${btoa(dataAppUrl)}`)
            const response = await axiosWithInterceptorInstance.get<ApiResponse2>(`${apiRetrived}/entity?id=${data?.id}&provider_ecc=${btoa(apiAdd)}&consumer_fiware=${btoa(apiAdd2)}&consumer_data_app=${btoa(dataAppUrl)}`,
            
                {
                    data: {},

                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                console.log("risposta")
                console.log(response)
                console.log("dato di richiesta ")
                console.log(data)
           if (data) {

                const fileData: string = response.data.filedata;
                const base64Response: string = fileData.split(';base64,').pop()!;
                const blob: Blob = base64ToBlob(base64Response, 'text/plain');

                const url: string = URL.createObjectURL(blob);

                const link: HTMLAnchorElement = document.createElement('a');
                link.href = url;
                link.setAttribute('download', data.fileName);

                document.body.appendChild(link);
                link.click();

                document.body.removeChild(link);
                URL.revokeObjectURL(url);
            }

        } catch (error) {
            console.error('Download failed', error);
        } finally {
            setIsLoading(false);
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
            <h2> <i className="fas fa-external-link-alt nav-icon" style={{ paddingRight: "8px" }}> </i> <b>Data Entity</b></h2>
            <h5>Consume Data Entity</h5>
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
                        {data && <div className='row d-flex flex-nowrap'>
                            <div className='col'>
                                <Form.Control
                                    type="text"
                                    value={data.fileName}
                                    aria-label="Disabled input example"
                                    readOnly
                                />
                            </div>
                            <div className='col-2'>


                                {!isLoading && <button className="btn btn-primary" onClick={() => downloadFile()}>
                                    Download
                                </button>}

                                {isLoading && <button className="btn btn-primary" onClick={() => downloadFile()}>
                                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                    Downloading...
                                </button>}


                            </div>
                        </div>}
                    </ListGroup.Item>
                </ListGroup>
            </Card>
            <Card >
                <h3 className="list-group-item-heading" style={{ paddingLeft: "20px", paddingTop: "20px" }}><b>Assigned To Data Offering</b></h3>


                <ListGroup variant="flush">
                    <ListGroup.Item><Label for="id">Data Offering</Label>
                        <Input type="text" name="id" id="id" value={data?.data_catalog_data_offerings_id} /></ListGroup.Item>

                    <ListGroup.Item><Label for="id">Profile Format</Label>
                        <Input type="text" name="id" id="id" value={data?.data_catalog_data_offerings_obj.profile_selector} /></ListGroup.Item>

                    <ListGroup.Item><Label for="title">Profile Description</Label>
                        <Input type="text" name="title" id="title" value={data?.data_catalog_data_offerings_obj.profile_description} />
                    </ListGroup.Item>
                </ListGroup>

                <div className='row' >
                    <div className='col' >
                        <ListGroup.Item style={{ border: 'none', boxShadow: 'none' }} ><Label for="title">Business Object Code</Label>
                            <Form.Control
                                type="text"
                                value={data?.data_catalog_data_offerings_obj.data_catalog_business_object_obj.code}

                            /></ListGroup.Item>
                    </div>
                    <div className='col'>
                        <ListGroup.Item style={{ border: 'none', boxShadow: 'none' }}><Label for="title">Business Object Name</Label>
                            <Form.Control
                                type="text"
                                value={data?.data_catalog_data_offerings_obj.data_catalog_business_object_obj.name}

                            /></ListGroup.Item>
                    </div>
                </div>
                <div className='row' >
                    <div className='col' >
                        <ListGroup.Item style={{ border: 'none', boxShadow: 'none' }} ><Label for="title">Service Code</Label>
                            <Form.Control
                                type="text"
                                value={data?.data_catalog_data_offerings_obj.data_catalog_business_object_obj.data_catalog_service_obj.code}

                            /></ListGroup.Item>
                    </div>
                    <div className='col'>
                        <ListGroup.Item style={{ border: 'none', boxShadow: 'none' }}><Label for="title">Service Name</Label>
                            <Form.Control
                                type="text"
                                value={data?.data_catalog_data_offerings_obj.data_catalog_business_object_obj.data_catalog_service_obj.name}

                            /></ListGroup.Item>
                    </div>
                </div>
                <div className='row' >
                    <div className='col' >
                        <ListGroup.Item style={{ border: 'none', boxShadow: 'none' }} ><Label for="title">Category Code</Label>
                            <Form.Control
                                type="text"
                                value={data?.data_catalog_data_offerings_obj.data_catalog_business_object_obj.data_catalog_service_obj.data_catalog_category_obj.code}

                            /></ListGroup.Item>
                    </div>
                    <div className='col'>
                        <ListGroup.Item style={{ border: 'none', boxShadow: 'none' }}><Label for="title">Category Name</Label>
                            <Form.Control
                                type="text"
                                value={data?.data_catalog_data_offerings_obj.data_catalog_business_object_obj.data_catalog_service_obj.data_catalog_category_obj.name}

                            /></ListGroup.Item>
                    </div>
                </div>


            </Card>





        </Container>
    );
};

export default EditDataEntity;

