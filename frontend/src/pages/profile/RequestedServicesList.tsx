import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Button from 'react-bootstrap/Button';
import Table from 'react-bootstrap/Table';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, Row, Col, Form } from 'react-bootstrap';
import Categories from '../modals/Categories';
import Service from '../modals/Service';
import BusinnesObject from '../modals/BusinnesObject';
import { EditRequest } from '@app/components/helpers/Buttons';
import Offering from '../modals/Offering';
import { useLocation } from 'react-router-dom';
import Inner from '@app/components/helpers/InnerHtml';
import { Card } from 'reactstrap';
import AxiosWithInterceptorInstance from '@app/components/helpers/AxiosConfig';
import axiosWithInterceptorInstance from '@app/components/helpers/AxiosConfig';


interface IFilterValues {
    sqlf_10: string;
    data_catalog_category_id: string;
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
    data_catalog_category_id: string;
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


const RequestedServicesList: React.FC = () => {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const id = queryParams.get('id');
    const API_URL_FILTERS = `/datalist/left-grouping/requests_on_offered_services?id=607fe472-e51d-44c5-a9c3-ba8ec09208d0&ft_id_offering=${id}`;
    const API_URL_DATA = `/datalist/requests_on_offered_services?ft_id_offering=${id}`;
    const [data, setData] = useState<ITableData[]>([]);
    const [filters, setFilters] = useState<IFilter[]>([]);
    type ExpandedFiltersByLevel = { [level: number]: string | null };
    const [expandedFiltersByLevel, setExpandedFiltersByLevel] = useState<ExpandedFiltersByLevel>({});
    const [filterValues, setFilterValues] = useState<IFilterValues>({
        sqlf_10: "",
        data_catalog_category_id: "",
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
        category_id: "",
        service_id: "",
        business_object_id: "",
        user_requesting_id: "",
        offering_id: ""

    });
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        fetchData();
    };
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFilterValues({ ...filterValues, [e.target.name]: e.target.value });

    };

    useEffect(() => {
        fetchData();
    }, [filterValuesFromModals, expandedFiltersByLevel]);

    useEffect(() => {
        fetchFilters();
    }, []);



    const fetchFilters = async () => {
        try {
            const response = await AxiosWithInterceptorInstance.get<IFilter[]>(API_URL_FILTERS);
            setFilters(response.data.filter(element => element.value !== null));
        } catch (error) {
            console.error('Error fetching filters:', error);
        }
    };

    const generateFilterQuery = () => {
        let query = '';
        let index = 0;
        const filterKeys: (keyof IFilterValues)[] = ['sqlf_10', 'title', 'sqlf_9', 'cf_profile_selector', 'cf_profile_description', 'sqlf_11', 'sqlf_12', 'data_catalog_category_id', 'category', 'user_requesting', 'created_on', 'status', 'cf_comments'];

        filterKeys.forEach(key => {
            if (filterValues[key]) {
                query += `&${encodeURIComponent(key)}=${encodeURIComponent(filterValues[key])}`;
            }
        });
        for (let [key, value] of Object.entries(filterValuesFromModals)) {
            if (value) {

                if (key === "category_id") {
                    key = "data_catalog_category_id"
                }
                if (key === "service_id") {
                    key = "data_catalog_category_id"
                }
                if (key === "business_object_id") {
                    key = "data_catalog_category_id"
                }

                if (index > 0) {
                    query += `&${encodeURIComponent(key)}=${encodeURIComponent(value)}`;

                } else {
                    query += `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
                    index = index + 1;
                }
            }
        }
        return query;
    };

    const fetchData = async () => {
        try {
            let filterQuery = '';
            let filter2Query = generateFilterQuery();
            if (expandedFiltersByLevel[0]) {

                filterQuery = `&${encodeURIComponent("category_grouping")}=${encodeURIComponent(expandedFiltersByLevel[0])}`;
            }

            if (expandedFiltersByLevel[1]) {

                filterQuery = filterQuery + `&${encodeURIComponent("service_grouping")}=${encodeURIComponent(expandedFiltersByLevel[1])}`;
            }
            if (expandedFiltersByLevel[2]) {

                filterQuery = filterQuery + `&${encodeURIComponent("business_object_grouping")}=${encodeURIComponent(expandedFiltersByLevel[2])}`;
            }
            if (expandedFiltersByLevel[3]) {

                filterQuery = filterQuery + `&${encodeURIComponent("users_grouping")}=${encodeURIComponent(expandedFiltersByLevel[3])}`;
            }

            const response = await axiosWithInterceptorInstance.get(`${API_URL_DATA}${filterQuery}${filter2Query}`);

            setData(response?.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const toggleExpand = (filterKey: string, level: number) => {

        setExpandedFiltersByLevel(prev => ({
            ...prev,
            [level]: prev[level] === filterKey ? null : filterKey
        }));

    };

    const renderButtonGroup = (filters: IFilter[], level = 0, parentKey = ''): JSX.Element[] => {
        return filters.map((filter, index) => {
            const filterKey = `${parentKey}${filter.code}-${filter.value}-${index}`;
            return (
                <div key={filterKey}>
                    <Button
                        variant="link"
                        onClick={() => toggleExpand(filter.value, level)}
                    >

                        {expandedFiltersByLevel[level] === filter.value ? '-' : '+'} {filter.value}
                    </Button>
                    {expandedFiltersByLevel[level] === filter.value && filter.children && (
                        <div style={{ paddingLeft: '20px' }}>
                            {renderButtonGroup(filter.children, level + 1, filterKey)}
                        </div>
                    )}
                </div>
            );
        });
    };
    const representHierarchy = () => {
        let hierarchy = Object.values(expandedFiltersByLevel).join(" >> ");
        return hierarchy;
    };


    const renderActiveFilter = () => {
        return expandedFiltersByLevel && (
            <div>
                <p>Active Filter: <br></br> <b>{representHierarchy()}</b></p>

                <Button variant="outline-danger" onClick={clearActiveFilter}>Clear Filter</Button>
            </div>
        );
    };

    const clearActiveFilter = () => {
        setExpandedFiltersByLevel([]);
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

    type ModalFilter = {
        name: string;
        id: string;
    }
    const handleModalDataChange = (modalName: string, value: ModalFilter) => {
        setFilterValuesFromModals({ ...filterValuesFromModals, [modalName]: value });
    };

    return (
        <Container fluid>
            <h2> <i className="fas fa-handshake nav-icon" style={{ paddingRight: "8px" }}> </i> <b>Requests</b></h2>
            <h5>Navigate to the Requests for your Offered Services</h5>
            <Row style={{ paddingTop: "30px", flexWrap: "nowrap", display: "flex" }}>

                <Col md={2} style={{ display: 'flex', flexDirection: 'column' }}>
                    <Card>
                        <h5 style={{ paddingLeft: "10px", paddingTop: "10px" }}><b>Offered Services Categorization</b></h5>
                        <h6 style={{ padding: "10px" }}>Navigate & Filter Data Offerings by Category, Service, Business Object & User categorization tree </h6>
                        {renderButtonGroup(filters)}
                        {renderActiveFilter()}
                    </Card>
                    <Card>
                        <h5 style={{ paddingLeft: "10px", paddingTop: "10px" }}><b>Filters</b></h5>
                        <h6 style={{ padding: "10px" }}>Select & Refine Seach </h6>
                        <table className="table">

                            <tbody>
                                <tr>
                                    <td>
                                        <div className="input-group" style={{ transform: "scale(0.8)" }}>
                                            <button onClick={() => handleOpenModal('offeringModal')} className="btn btn-outline-secondary" type="button" id="button-addon1">
                                                <i className="fas fa-search"></i>
                                                Offering
                                            </button>
                                            <input className="form-control" placeholder={filterValuesFromModals.offering_id} aria-label="Example text with button addon" aria-describedby="button-addon1" />
                                            <button onClick={() => cancelModalFilters('offering_id')} className="btn btn-outline-secondary" type="button" id="button-addon1">
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
                                            <input className="form-control" placeholder={filterValuesFromModals.category_id} aria-label="Example text with button addon" aria-describedby="button-addon1" />
                                            <button onClick={() => cancelModalFilters('category_id')} className="btn btn-outline-secondary" type="button" id="button-addon1">
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
                                            <input className="form-control" placeholder={filterValuesFromModals.service_id} aria-label="Example text with button addon" aria-describedby="button-addon1" />
                                            <button onClick={() => cancelModalFilters('service_id')} className="btn btn-outline-secondary" type="button" id="button-addon1">
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
                                            <input className="form-control" placeholder={filterValuesFromModals.business_object_id} aria-label="Example text with button addon" aria-describedby="button-addon1" />
                                            <button onClick={() => cancelModalFilters('business_object_id')} className="btn btn-outline-secondary" type="button" id="button-addon1">
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
                                            <input className="form-control" placeholder={filterValuesFromModals.user_requesting_id} aria-label="Example text with button addon" aria-describedby="button-addon1" />
                                            <button onClick={() => cancelModalFilters('user_requesting_id')} className="btn btn-outline-secondary" type="button" id="button-addon1">
                                                <i className="fas fa-trash"></i>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table></Card>
                </Col>
                <Col >
                    <Form onSubmit={handleSubmit}>
                        <Table striped bordered hover>
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th></th>
                                    <th>Category</th>
                                    <th>Title </th>
                                    <th>User requesting</th>
                                    <th>Status</th>
                                    <th>Created on</th>
                                    <th>Comments</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td></td>
                                    <td></td>
                                    <td><Form.Control
                                        type="text"
                                        name="sqlf_10"
                                        placeholder="Filter"
                                        value={filterValues.sqlf_10}
                                        onChange={handleInputChange}
                                    /></td>

                                    <td><Form.Control
                                        type="text"
                                        name="title"
                                        placeholder="Filter"
                                        value={filterValues.title}
                                        onChange={handleInputChange}
                                    /></td>

                                    <td><Form.Control
                                        type="text"
                                        name="cf_profile_selector"
                                        placeholder="Filter"
                                        value={filterValues.cf_profile_selector}
                                        onChange={handleInputChange}
                                    /></td>

                                    <td><Form.Control
                                        type="text"
                                        name="cf_profile_description"
                                        placeholder="Filter"
                                        value={filterValues.cf_profile_description}
                                        onChange={handleInputChange}
                                    /></td>
                                    <td><Form.Control
                                        type="text"
                                        name="sqlf_11"
                                        placeholder="Filter"
                                        value={filterValues.sqlf_11}
                                        onChange={handleInputChange}
                                    /></td>
                                    <td><Form.Control
                                        type="text"
                                        name="sqlf_12"
                                        placeholder="Filter"
                                        value={filterValues.sqlf_12}
                                        onChange={handleInputChange}
                                    /></td>
                                </tr>
                                {data.map((item, index) => (
                                    <tr key={index}>
                                        <th scope="row">{index + 1}</th>
                                        <td>
                                            <Button variant="outline-light" className="btn btn-primary" onClick={() => EditRequest(item.request_id)}>
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

export default RequestedServicesList;
