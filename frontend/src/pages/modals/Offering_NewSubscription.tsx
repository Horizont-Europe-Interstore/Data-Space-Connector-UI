import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Modal, Container, Row } from 'react-bootstrap';
import moment from 'moment';
import Inner from '@app/components/helpers/InnerHtml';

// Definizione delle tipologie delle props
interface CategorizeProps {
    show: boolean;
    handleClose: () => void;
    onModalDataChange: (modalName: string, value: string) => void;
}

interface ITableData {
    sqlf_10: string;
    cf_code_2: string;
    sqlf_9: string;
    cf_name_2: string;
    cf_id: string,
    cf_input_profile: string;
    cf_title: string;
    cf_profile_selector: string;
    cf_input_data_source: string;
    sqlf_9_1: string
}
const Offering: React.FC<CategorizeProps> = ({ show, handleClose, onModalDataChange }) => {
    const [data, setData] = useState<ITableData[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get('/list/results/page/0?id=3878c122-7fb7-40fb-97b0-bfb66c8b35ca&ft_id_2=9a7db9a7-9942-499a-a5ac-0a41a99b7b87&ft_status=active&dates_check=active&country_check=active&cluster_check=active&market_check=active&role_check=active&language-id=2');
                setData(response.data.listContent);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, []);
    const handleFilter = (filter: string) => {
        onModalDataChange('offeringModal_id', filter);
        handleClose();
    };

    return (
        <><style type="text/css">
            {`
        .modal-90w {
          max-width: 90% !important;
        }
        `}
        </style>
            <Modal show={show} onHide={handleClose} dialogClassName="modal-90w">
                <Modal.Header closeButton>
                    <h5 className="modal-title"> Available Services</h5>
                </Modal.Header>
                <Modal.Body>
                    <Container fluid style={{ backgroundColor: '#f4f4f4' }}>
                        <Row>
                            <table className="table table-hover table-striped table-bordered table-sm">
                                <thead>
                                    <tr>

                                        <th>#</th>
                                        <th></th>
                                        <th style={{ textAlign: "center", verticalAlign: "middle" }}>Category</th>
                                        <th style={{ textAlign: "center", verticalAlign: "middle" }}>Title </th>
                                        <th style={{ textAlign: "center", verticalAlign: "middle" }}>User Offering</th>
                                        <th style={{ textAlign: "center", verticalAlign: "middle" }}>Created On </th>
                                        <th style={{ textAlign: "center", verticalAlign: "middle" }}>Input Profile </th>
                                        <th style={{ textAlign: "center", verticalAlign: "middle" }}>Input Data Source </th>

                                    </tr>
                                </thead>
                                <tbody>
                                    {data.map((item, index) => (
                                        <tr key={index}>
                                            <th scope="row">{index + 1}</th>
                                            <td> <button className="btn btn-primary text-end" onClick={() => handleFilter(item.cf_id)}>
                                                +
                                            </button></td>
                                            <td>{Inner(item.sqlf_10)}</td>
                                            <td>{Inner(item.sqlf_9_1)}</td>

                                            <td>{item.cf_title}</td>
                                            <td>{item.sqlf_9}</td>
                                            <td>{item.cf_input_profile}</td>
                                            <td>{item.cf_input_data_source}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </Row>
                    </Container>
                </Modal.Body>
            </Modal></>
    );
}

export default Offering;
