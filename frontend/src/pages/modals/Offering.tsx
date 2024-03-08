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
}
const Offering: React.FC<CategorizeProps> = ({ show, handleClose, onModalDataChange }) => {
    const [data, setData] = useState<ITableData[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get('/list/results/page/0?id=b27f851e-9a2d-4d8b-8695-dde591a0b8be&ft_created_by=9a7db9a7-9942-499a-a5ac-0a41a99b7b87&ft_status=active&language-id=2');
                setData(response.data.listContent);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, []);
    const handleFilter = (filter: string) => {
        const firstItem = data[0];
        onModalDataChange('offeringModal_id',filter);
        handleClose();
    };

    return (
        <Modal show={show} onHide={handleClose} size="lg" centered>
            <Modal.Header closeButton>
                <h5 className="modal-title">Offering</h5>
            </Modal.Header>
            <Modal.Body>
                <Container fluid style={{ backgroundColor: '#f4f4f4', padding: '30px' }}>
                    <Row>
                        <div className="container mt-5">
                            <table className="table table-hover table-striped table-bordered table-sm">
                                <thead>
                                    <tr>

                                        <th>#</th>
                                        <th></th>
                                        <th style={{ textAlign: "center", verticalAlign: "middle" }}>Category</th>
                                        <th style={{ textAlign: "center", verticalAlign: "middle" }}>Title </th>
                                        <th style={{ textAlign: "center", verticalAlign: "middle" }}>Created on </th>
                                        <th style={{ textAlign: "center", verticalAlign: "middle" }}>Input profile </th>
                                        <th style={{ textAlign: "center", verticalAlign: "middle" }}>Input data source </th>

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
                                            <td>{item.cf_title}</td>
                                            <td>{item.sqlf_9}</td>
                                            <td>{item.cf_input_profile}</td>
                                            <td>{item.cf_input_data_source}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Row>
                </Container>
            </Modal.Body>
        </Modal>
    );
}

export default Offering;
