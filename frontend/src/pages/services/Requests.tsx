import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Button from 'react-bootstrap/Button';
import Table from 'react-bootstrap/Table';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, Row, Col, Form, Card } from 'react-bootstrap';
import Categories from '../modals/Categories';
import Service from '../modals/Service';
import BusinnesObject from '../modals/BusinnesObject';
import { EditRequest } from '@app/components/helpers/Buttons';
import Offering from '../modals/Offering';
import Inner from '@app/components/helpers/InnerHtml';
if (localStorage.getItem("token")) {
    axios.defaults.headers.common["Authorization"] = `Bearer ${localStorage.getItem("token")}`;
}
const API_URL_FILTERS = "/list/left-grouping/results?language-id=2&id=607fe472-e51d-44c5-a9c3-ba8ec09208d0";
const API_URL_DATA = "/datalist/requests_on_offered_services";
interface IFilterValues {
    sqlf_10: string;
    cf_id: string;
    title: string;
    sqlf_9: string;
    cf_profile_selector: string;
    cf_profile_description: string;
    sqlf_11: string;
    sqlf_12: string;
    category: string;
    created_on: string;
    user_requesting: string;
    status: string;
    cf_comments: string;
}
interface IFilter {
    id: string | null;
    code: string;
    value: string;
    count: number;
    parent: IFilter | null;
    children: IFilter[];
}
interface ITableData {
    sqlf_10: string;
    cf_id: string;
    title: string;
    sqlf_9: string;
    cf_profile_selector: string;
    cf_profile_description: string;
    sqlf_11: string;
    sqlf_12: string;
    category: string;
    user_requesting: string;
    created_on: string;
    status: string;
    cf_comments: string;
    request_id: string;
}
const Requests: React.FC = () => {
    const [data, setData] = useState<ITableData[]>([]);
    const [filters, setFilters] = useState<IFilter[]>([]);
    const [activeFilter, setActiveFilter] = useState<{ parentCode: string, parentValue: string, code: string, value: string } | null>(null);
    const [expandedFilter, setExpandedFilter] = useState<string | null>(null);
    const [filterValues, setFilterValues] = useState<IFilterValues>({
        sqlf_10: "",
        cf_id: "",
        title: "",
        sqlf_9: "",
        cf_profile_selector: "",
        cf_profile_description: "",
        sqlf_11: "",
        sqlf_12: "",
        category: "",
        user_requesting: "",
        created_on: "",
        status: "",
        cf_comments: ""
    });
    const [modalStates, setModalStates] = useState({
        categoriesModal: false,
        serviceModal: false,
        businnesObjectModal: false,
        offeringModal: false,
        userRequestingModal: false

    });

    const [filterValuesFromModals, setFilterValuesFromModals] = useState({
        ft_id: "",
        ft_id2: "",
        catalog_business_object_id: "",
        offeringModal_id: "",
        userRequestingModal_id: ""

    });

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        // Call fetchData here, which will use the updated filterValues
        fetchData();
    };
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFilterValues({ ...filterValues, [e.target.name]: e.target.value });

    };

    useEffect(() => {
        fetchData();
    }, [activeFilter, filterValuesFromModals]);

    useEffect(() => {
        fetchFilters();
    }, []);

    const fetchFilters = async () => {
        try {
            const response = await axios.get<IFilter[]>(API_URL_FILTERS);
            setFilters(response.data.filter(element => element.value !== null));
        } catch (error) {
            console.error('Error fetching filters:', error);
        }
    };

    const generateFilterQuery = () => {
        let query = '';
        let index = 0;
        const filterKeys: (keyof IFilterValues)[] = ['sqlf_10', 'title', 'sqlf_9', 'cf_profile_selector', 'cf_profile_description', 'sqlf_11', 'sqlf_12', 'cf_id', 'category', 'user_requesting', 'created_on', 'status', 'cf_comments'];

        filterKeys.forEach(key => {
            if (filterValues[key]) {

                if (index > 1) {
                    query += `&${encodeURIComponent(key)}=${encodeURIComponent(filterValues[key])}`;

                } else {
                    query += `${encodeURIComponent(key)}=${encodeURIComponent(filterValues[key])}`;

                }
            }
        });
        // modali
        for (let [key, value] of Object.entries(filterValuesFromModals)) {
            if (value) {

                if (key === "ft_id2") {
                    key = "ft_id"
                }
                query += `&${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
            }
        }

        //query += '&language-id=2';
        return query;
    };

    const fetchData = async () => {
        try {
            let filterQuery = '';
            let filter2Query = generateFilterQuery();
            if (activeFilter) {
                filterQuery = `&${encodeURIComponent(activeFilter.parentCode)}=${encodeURIComponent(activeFilter.parentValue)}&${encodeURIComponent(activeFilter.code)}=${encodeURIComponent(activeFilter.value)}`;
            }

            const response = await axios.get<ITableData[]>(`${API_URL_DATA}?${filterQuery}${filter2Query}`);
            setData(response.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const toggleExpand = (filterKey: string) => {
        setExpandedFilter(expandedFilter !== filterKey ? filterKey : null);
    };

    const handleFilterClick = (parentCode: string, parentValue: string, childCode: string, childValue: string) => {
        setActiveFilter({ parentCode, parentValue, code: childCode, value: childValue });
    };

    const clearActiveFilter = () => {
        setActiveFilter(null);
    };

    const renderButtonGroup = (filters: IFilter[]) => {
        return filters.map((filter, index) => (
            <div key={`${filter.code}-${filter.value}`}>
                <span>
                    <Button variant="link" onClick={() => toggleExpand(`${filter.code}-${filter.value}`)}>
                        {expandedFilter === `${filter.code}-${filter.value}` ? '-' : '+'}
                    </Button>
                    {filter.value}
                </span>
                {renderFilterChildren(filter, filter.children)}
            </div>
        ));
    };

    const renderFilterChildren = (parentFilter: IFilter, children: IFilter[]) => {
        return expandedFilter === `${parentFilter.code}-${parentFilter.value}` && (
            <div style={{ paddingLeft: 20 }}>
                {children.map(child => (
                    <Button
                        key={child.code} // Qui si può mantenere solo child.code se è unico tra i figli
                        variant={activeFilter?.code === child.code && activeFilter?.value === child.value ? "primary" : "outline-secondary"}
                        onClick={() => handleFilterClick(parentFilter.code, parentFilter.value, child.code, child.value)}
                    >
                        {child.value}
                    </Button>
                ))}
            </div>
        );
    };


    const renderActiveFilter = () => {
        return activeFilter && (
            <div>
                <p>Active Filter: {activeFilter.value}</p>
                <Button variant="outline-danger" onClick={clearActiveFilter}>Clear Filter</Button>
            </div>
        );
    };


    const cancelModalFilters = (modalName: string) => {
        setFilterValuesFromModals({
            ...filterValuesFromModals,
            [modalName]: ""
        });
    };

    const handleOpenModal = (modalName: string) => {
        setModalStates({ ...modalStates, [modalName]: true });
    };

    const handleCloseModal = (modalName: string) => {
        setModalStates({ ...modalStates, [modalName]: false });
    };

    const handleModalDataChange = (modalName: string, value: string) => {
        setFilterValuesFromModals({ ...filterValuesFromModals, [modalName]: value });
    };

    return (
        <Container fluid>
            <h2> <i className="fas fa-paper-plane nav-icon" style={{ paddingRight: "8px" }}> </i> <b>Requests</b></h2>
            <h5>Navigate to the Requests for your Offered Services</h5>
            <Row style={{ paddingTop: "30px", flexWrap: "nowrap", display: "flex" }}>
                <Col md={2} style={{ display: 'flex', flexDirection: 'column' }}>
                    <Card>
                        <h5 style={{ paddingLeft: "10px", paddingTop: "10px" }}><b>Categorization</b></h5>
                        <h6 style={{ padding: "10px" }}>Navigate & Filter Data Requests by Category, Service, Business Object & User categorization tree </h6>
                        {renderButtonGroup(filters)}
                        {renderActiveFilter()}
                    </Card>
                    <Card>
                        <h5 style={{ paddingLeft: "10px", paddingTop: "10px" }}><b>Filters</b></h5>
                        <h6 style={{ padding: "10px" }}>Select & Refine Search </h6>
                        <table className="table">
                            <tbody>
                                <tr>
                                    <td>
                                        <div className="input-group" style={{ transform: "scale(0.8)" }}>
                                            <button onClick={() => handleOpenModal('offeringModal')} className="btn btn-outline-secondary" type="button" id="button-addon1">
                                                <i className="fas fa-search"></i>
                                                Offering
                                            </button>
                                            <input className="form-control" placeholder={filterValuesFromModals.offeringModal_id} aria-label="Example text with button addon" aria-describedby="button-addon1" />
                                            <button onClick={() => cancelModalFilters('offeringModal_id')} className="btn btn-outline-secondary" type="button" id="button-addon1">
                                                <i className="fas fa-trash"></i>

                                            </button>
                                        </div>
                                    </td>
                                </tr>

                                <tr>
                                    <td>
                                        <div className="input-group" style={{ transform: "scale(0.8)" }}>
                                            <button onClick={() => handleOpenModal('categoriesModal')} className="btn btn-outline-secondary" type="button" id="button-addon1">
                                                <i className="fas fa-search"></i>
                                                Categories
                                            </button>
                                            <input className="form-control" placeholder={filterValuesFromModals.ft_id} aria-label="Example text with button addon" aria-describedby="button-addon1" />
                                            <button onClick={() => cancelModalFilters('ft_id')} className="btn btn-outline-secondary" type="button" id="button-addon1">
                                                <i className="fas fa-trash"></i>

                                            </button>
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <div className="input-group" style={{ transform: "scale(0.8)" }}>
                                            <button onClick={() => handleOpenModal('serviceModal')} className="btn btn-outline-secondary" type="button" id="button-addon1">
                                                <i className="fas fa-search"></i>
                                                Service
                                            </button>
                                            <input className="form-control" placeholder={filterValuesFromModals.ft_id2} aria-label="Example text with button addon" aria-describedby="button-addon1" />
                                            <button onClick={() => cancelModalFilters('ft_id2')} className="btn btn-outline-secondary" type="button" id="button-addon1">
                                                <i className="fas fa-trash"></i>

                                            </button>
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <div className="input-group" style={{ transform: "scale(0.8)" }}>
                                            <button onClick={() => handleOpenModal('businnesObjectModal')} className="btn btn-outline-secondary" type="button" id="button-addon1">
                                                <i className="fas fa-search"></i>
                                                Businnes object
                                            </button>
                                            <input className="form-control" placeholder={filterValuesFromModals.catalog_business_object_id} aria-label="Example text with button addon" aria-describedby="button-addon1" />
                                            <button onClick={() => cancelModalFilters('catalog_business_object_id')} className="btn btn-outline-secondary" type="button" id="button-addon1">
                                                <i className="fas fa-trash"></i>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <div className="input-group" style={{ transform: "scale(0.8)" }}>
                                            <button onClick={() => handleOpenModal('userRequestingModal')} className="btn btn-outline-secondary" type="button" id="button-addon1">
                                                <i className="fas fa-search"></i>
                                                User Requesting
                                            </button>
                                            <input className="form-control" placeholder={filterValuesFromModals.catalog_business_object_id} aria-label="Example text with button addon" aria-describedby="button-addon1" />
                                            <button onClick={() => cancelModalFilters('userRequestingModal_id')} className="btn btn-outline-secondary" type="button" id="button-addon1">
                                                <i className="fas fa-trash"></i>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </Card>
                </Col>
                <Col>

                    <Form onSubmit={handleSubmit}>
                        <Table striped bordered hover>
                            <thead>

                                <tr>
                                    <th>#</th>
                                    <th></th>
                                    <th style={{ textAlign: "center", verticalAlign: "middle" }}>Category</th>
                                    <th style={{ textAlign: "center", verticalAlign: "middle" }}>Title </th>
                                    <th style={{ textAlign: "center", verticalAlign: "middle" }}>User requesting</th>
                                    <th style={{ textAlign: "center", verticalAlign: "middle" }}>Status</th>
                                    <th style={{ textAlign: "center", verticalAlign: "middle" }}>Created on</th>
                                    <th style={{ textAlign: "center", verticalAlign: "middle" }}>Comments</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td></td>
                                    <td></td>
                                    <td></td>

                                    <td></td>

                                    <td></td>

                                    <td><Form.Control
                                        type="text"
                                        name="status"
                                        placeholder="Filter"
                                        value={filterValues.status}
                                        onChange={handleInputChange}
                                    /></td>


                                    <td><Form.Control
                                        type="text"
                                        name="created_on"
                                        placeholder="Filter"
                                        value={filterValues.created_on}
                                        onChange={handleInputChange}
                                    /></td>
                                    <td><Form.Control
                                        type="text"
                                        name="cf_comments"
                                        placeholder="Filter"
                                        value={filterValues.cf_comments}
                                        onChange={handleInputChange}
                                    /></td>

                                </tr>

                                {data.map((item, index) => (
                                    <tr key={index}>
                                        <th scope="row">{index + 1}</th>
                                        <td>
                                            <Button variant="outline-light" className="btn btn-primary" onClick={() => EditRequest(item.request_id)} data-bs-toggle="tooltip" data-placement="top" title="Edit a request that you have received">
                                                <i className="fas fa-pencil-alt"></i>
                                            </Button>

                                        </td>
                                        <td>{Inner(item.category)}</td>
                                        <td>{item.title}</td>
                                        <td>{Inner(item.user_requesting)}</td>
                                        <td>{item.status}</td>
                                        <td>{item.created_on}</td>
                                        <td>{item.cf_comments}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                        {modalStates.offeringModal && (
                            <Offering
                                show={modalStates.offeringModal}
                                handleClose={() => handleCloseModal('offeringModal')}
                                onModalDataChange={handleModalDataChange}
                            />
                        )}
                        {modalStates.categoriesModal && (
                            <Categories
                                show={modalStates.categoriesModal}
                                handleClose={() => handleCloseModal('categoriesModal')}
                                onModalDataChange={handleModalDataChange}
                            />
                        )}
                        {modalStates.serviceModal && (
                            <Service
                                show={modalStates.serviceModal}
                                handleClose={() => handleCloseModal('serviceModal')}
                                onModalDataChange={handleModalDataChange}
                            />
                        )}
                        {modalStates.businnesObjectModal && (
                            <BusinnesObject
                                show={modalStates.businnesObjectModal}
                                handleClose={() => handleCloseModal('businnesObjectModal')}
                                onModalDataChange={handleModalDataChange}
                            />
                        )}
                        {modalStates.userRequestingModal && (
                            <Categories
                                show={modalStates.userRequestingModal}
                                handleClose={() => handleCloseModal('userRequestingModal')}
                                onModalDataChange={handleModalDataChange}
                            />
                        )}

                        <Button type="submit" style={{ display: 'none' }}>Invia</Button>

                    </Form>
                </Col>
            </Row>
        </Container>
    );
};

export default Requests;
