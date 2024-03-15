import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Button from 'react-bootstrap/Button';
import Table from 'react-bootstrap/Table';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, Row, Col, Form, Card } from 'react-bootstrap';
import Categories from '../modals/Categories';
import Service from '../modals/Service';
import BusinnesObject from '../modals/BusinnesObject';
import { EditSubscription } from '@app/components/helpers/Buttons';
import Offering from '../modals/Offering';
import Inner from '@app/components/helpers/InnerHtml';
import Pagination from '@app/components/helpers/Pagination';
import { NewSubscription } from '@app/components/helpers/Buttons';
import { format } from 'date-fns';
if (localStorage.getItem("token")) {
    axios.defaults.headers.common["Authorization"] = `Bearer ${localStorage.getItem("token")}`;
}
const API_URL_FILTERS = "/list/left-grouping/results?id=607fe472-e51d-44c5-a9c3-ba8ec09208d0&ft_id_offering=0db22a09-e67e-4e3d-8190-5e6c68793116&language-id=2";
const API_URL_DATA = "/datalist/my_subscriptions/page/";

interface IFilterValues {
    sqlf_10: string;
    cf_id: string;
    title: string;
    sqlf_9: string;
    profile_selector: string;
    profile_description: string;
    sqlf_11: string;
    sqlf_12: string;
    category: string;
    sqlf_8: string;
    created_on: string;
    status: string;
    comments: string;
    user_offering: string;
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
    profile_selector: string;
    profile_description: string;
    sqlf_11: string;
    sqlf_12: string;
    category: string;
    created_on: string;
    sqlf_8: string;
    status: string;
    comments: string;
    user_offering: string;
    totalPages: string;
    my_subscription_id: string;
}
const MySubscriptions: React.FC = () => {
    const [data, setData] = useState<ITableData[]>([]);
    const [filters, setFilters] = useState<IFilter[]>([]);
    const [activeFilter, setActiveFilter] = useState<{ parentCode: string, parentValue: string, code: string, value: string } | null>(null);
    const [expandedFilter, setExpandedFilter] = useState<string | null>(null);
    const [filterValues, setFilterValues] = useState<IFilterValues>({
        sqlf_10: "",
        cf_id: "",
        title: "",
        sqlf_9: "",
        profile_selector: "",
        profile_description: "",
        sqlf_11: "",
        sqlf_12: "",
        category: "",
        created_on: "",
        sqlf_8: "",
        status: "",
        comments: "",
        user_offering: ""
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
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);

    useEffect(() => {
        fetchData();
    }, [currentPage]);
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        // Call fetchData here, which will use the updated filterValues
        fetchData();
    };
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const key = e.target.name as keyof IFilterValues;
        const value = e.target.value;
        setFilterValues(prevState => ({ ...prevState, [key]: value }));
        setCurrentPage(1)
        //setFilterValues({ ...filterValues, [e.target.name]: e.target.value });
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
        const filterKeys: (keyof IFilterValues)[] = ['sqlf_10', 'title', 'sqlf_9', 'profile_selector', 'profile_description', 'sqlf_11', 'sqlf_12', 'cf_id', 'category', 'created_on', 'sqlf_8', 'status', 'comments', 'user_offering'];

        filterKeys.forEach(key => {
            if (filterValues[key]) {
                query += `&${encodeURIComponent(key)}=${encodeURIComponent(filterValues[key])}`;
            }
        });
        // modali
        for (let [key, value] of Object.entries(filterValuesFromModals)) {
            if (value) {
                let index = 0;
                if (key === "ft_id2") {
                    key = "ft_id"
                }
                if (key in filterValues) {
                    const safeKey = key as keyof IFilterValues;

                    if (index > 0) {
                        query += `&${encodeURIComponent(key)}=${encodeURIComponent(filterValues[safeKey])}`;

                    } else {
                        query += `${encodeURIComponent(key)}=${encodeURIComponent(filterValues[safeKey])}`;
                        index = index + 1;
                    }
                }
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

            const response = await axios.get<{ listContent: ITableData[], totalPages: number }>(`${API_URL_DATA}${currentPage - 1}?${filterQuery}${filter2Query}`);
            setData(response.data.listContent);
            setTotalPages(response.data.totalPages);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };
    const paginate = (pageNumber: number): void => setCurrentPage(pageNumber);



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

            <div className='row' d-flex flex-nowrap>
                <div className='col-10'>
                    <h2> <i className="fas fa-newspaper nav-icon" style={{ paddingRight: "8px" }}> </i> <b>My Subscriptions</b></h2>
                    <h5>Navigate to your Offered Services</h5>
                </div>

                <div className='col'>
                    <Button onClick={() => NewSubscription()} className="btn btn-success">
                        New Subscription   <i className="fa fa-plus"></i>
                    </Button>
                </div>

            </div>
            <Row style={{ paddingTop: "30px", flexWrap:"nowrap", display:"flex"}}>
                <Col md={2} style={{ display: 'flex', flexDirection: 'column' }}>
                    <Card>
                        <h5 style={{ paddingLeft: "10px", paddingTop: "10px" }}><b> Categorization </b></h5>
                        <h6 style={{ padding: "10px" }}>Navigate & Filter Data Requests by Category, Service, Business Object & User categorization tree</h6>
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
                                        <div className="input-group " style={{ transform: "scale(0.8)" }}>
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
                                        <div className="input-group " style={{ transform: "scale(0.8)" }}>
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
                                        <div className="input-group " style={{ transform: "scale(0.8)" }}>
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
                                            <button onClick={() => handleOpenModal('businnesObjectModal')} className="btn btn-outline-secondary" type="button" id="button-addon1">
                                                <i className="fas fa-search"></i>
                                                User Requesting
                                            </button>
                                            <input className="form-control" placeholder={filterValuesFromModals.catalog_business_object_id} aria-label="Example text with button addon" aria-describedby="button-addon1" />
                                            <button onClick={() => cancelModalFilters('catalog_business_object_id')} className="btn btn-outline-secondary" type="button" id="button-addon1">
                                                <i className="fas fa-trash"></i>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table> </Card>
                </Col>
                <Col >
                    <Form onSubmit={handleSubmit}>
                        <Table striped bordered hover>
                            <thead>

                                <tr>
                                    <th>#</th>
                                    <th></th>
                                    {/* <th style={{ textAlign: "center", verticalAlign: "middle" }}>Category</th> */}
                                    <th style={{ textAlign: "center", verticalAlign: "middle" }}>Title </th>
                                    {/* <th style={{ textAlign: "center", verticalAlign: "middle" }}>User Offering</th> */}
                                    <th style={{ textAlign: "center", verticalAlign: "middle" }}>Status</th>
                                    <th style={{ textAlign: "center", verticalAlign: "middle" }}>Created on</th>
                                    <th style={{ textAlign: "center", verticalAlign: "middle" }}>Comments</th>
                                    <th style={{ textAlign: "center", verticalAlign: "middle" }}>Profile format</th>
                                    <th style={{ textAlign: "center", verticalAlign: "middle", maxWidth: "1px", wordBreak: 'break-word' }}>Profile description</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
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
                                        name="comments"
                                        placeholder="Filter"
                                        value={filterValues.comments}
                                        onChange={handleInputChange}
                                    /></td>
                                    <td><Form.Control
                                        type="text"
                                        name="profile_selector"
                                        placeholder="Filter"
                                        value={filterValues.profile_selector}
                                        onChange={handleInputChange}
                                    /></td>
                                    <td><Form.Control
                                        type="text"
                                        name="profile_description"
                                        placeholder="Filter"
                                        value={filterValues.profile_description}
                                        onChange={handleInputChange}
                                    /></td>

                                </tr>

                                {data.map((item, index) => (
                                    <tr key={index}>
                                        <th scope="row">{(((currentPage - 1)) * 10) + index + 1}</th>
                                        <td>
                                            <Button variant="outline-light" className="btn btn-primary" onClick={() => EditSubscription(item.my_subscription_id)}>
                                                <i className="fas fa-pencil-alt"></i>
                                            </Button>
                                        </td>
                                        {/* <td>{Inner(item.category)}</td> */}
                                        <td>{item.title}</td>
                                        {/* <td>{Inner(item.user_offering)}</td> */}
                                        <td>{item.status}</td>
                                        <td>{format(new Date(item.created_on), 'dd/MM/yyyy HH:mm')}</td>
                                        <td>{item.comments}</td>
                                        <td>{item.profile_selector}</td>
                                        <td style={{
                                            maxWidth: "180px",
                                            whiteSpace: "nowrap",
                                            overflow: "hidden",
                                            textOverflow: "ellipsis"
                                        }} data-toggle="tooltip" data-placement="top" title={item.profile_description}>{item.profile_description }
                                        </td>
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
                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <Pagination totalPages={totalPages} paginate={paginate} currentPage={currentPage} />
                        </div>
                    </Form>
                </Col>
            </Row>
        </Container>
    );
};

export default MySubscriptions;
