import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Row } from 'react-bootstrap';
import Modal from 'react-bootstrap/Modal';
// Definizione delle tipologie delle props
interface CategorizeProps {
    show: boolean;
    handleClose: () => void;
    onModalDataChange: (modalName: string, value: string[]) => void;
}

interface ITableData {
    cf_code_1: string;
    cf_code_2: string;
    cf_name: string;
    cf_name_2: string;
    cf_id: string,
    cf_short_description: string;
    cf_code: string;
    cf_profile_selector: string;
}
const BusinnesObject: React.FC<CategorizeProps> = ({ show, handleClose, onModalDataChange }) => {
    const [data, setData] = useState<ITableData[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get('/list/results/page/0?id=19068e51-d124-40c2-8773-0954d41719b7&ft_status=disable&language-id=2');
                setData(response.data.listContent);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, []);
    const handleFilter = (filter: ITableData) => {
        const firstItem = data[0];
        onModalDataChange('catalog_business_object_id', [filter.cf_id, filter.cf_code_2, filter.cf_code_1, filter.cf_code, filter.cf_name]);
        handleClose();
    };

    return (
        <Modal show={show} onHide={handleClose} size="lg" centered>
            <Modal.Header closeButton  >
                <Modal.Title>Titolo Modale</Modal.Title>
            </Modal.Header>

            <Modal.Body>
                <Container fluid style={{ backgroundColor: '#f4f4f4', padding: '30px' }}>
                    <Row >
                        <div className="container mt-5" >
                            <table className="table table-hover table-striped table-bordered table-sm">
                                <thead>
                                    <tr>

                                        <th>#</th>
                                        <th></th>
                                        <th style={{ textAlign: "center", verticalAlign: "middle" }}>Category</th>
                                        <th style={{ textAlign: "center", verticalAlign: "middle" }}>Service </th>
                                        <th style={{ textAlign: "center", verticalAlign: "middle" }}>Code</th>
                                        <th style={{ textAlign: "center", verticalAlign: "middle" }}>Name </th>

                                    </tr>
                                </thead>
                                <tbody>
                                    {data.map((item, index) => (
                                        <tr key={index}>
                                            <th scope="row">{index + 1}</th>
                                            <td> <button className="btn btn-primary text-end" onClick={() => handleFilter(item)}>
                                                +
                                            </button></td>

                                            <td>{item.cf_code_2}</td>
                                            <td>{item.cf_code_1}</td>
                                            <td>{item.cf_code}</td>
                                            <td>{item.cf_name}</td>
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

export default BusinnesObject;
