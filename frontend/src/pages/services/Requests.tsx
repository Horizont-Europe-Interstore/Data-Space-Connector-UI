import React, { useState, useEffect } from 'react';
import axios, { AxiosError } from 'axios';
import Button from 'react-bootstrap/Button';
import Table from 'react-bootstrap/Table';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, Row, Col, Form, Card, Dropdown } from 'react-bootstrap';
import Categories from '../modals/Categories';
import Service from '../modals/Service';
import BusinnesObject from '../modals/BusinnesObject';
import { EditRequest } from '@app/components/helpers/Buttons';
import Offering from '../modals/Offering';
import UserRequesting from '../modals/Userequesting';
import Inner from '@app/components/helpers/InnerHtml';
import Pagination from '@app/components/helpers/Pagination';
import { useLocation } from 'react-router-dom';
import checkLevel from '@app/components/helpers/CheckLevel';
import axiosWithInterceptorInstance from '@app/components/helpers/AxiosConfig';
import { ChangingOrder } from '@app/components/helpers/OrderingStateChange';
const API_URL_FILTERS = "/datalist/left-grouping/requests_on_offered_services";
const API_URL_DATA = "/datalist/requests_on_offered_services/page/";
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
    parrent: IFilter;
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
    cf_type: string;
}
const Requests: React.FC = () => {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const id = queryParams.get('id');
    const [data, setData] = useState<ITableData[]>([]);
    const [filters, setFilters] = useState<IFilter[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [pageSize, setPageSize] = useState(0);
    type ExpandedFiltersByLevel = { [level: number]: string | null };
    const [expandedFiltersByLevel, setExpandedFiltersByLevel] = useState<ExpandedFiltersByLevel>({});
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
        cf_comments: "",
       
    });
    const [modalStates, setModalStates] = useState({
        categoriesModal: false,
        serviceModal: false,
        businnesObjectModal: false,
        offeringModal: false,
        userRequestingModal: false

    });
    type FilterValuesFromModals = {
        category_id: ModalFilter;
        service_id: ModalFilter;
        business_object_id: ModalFilter;
        user_requesting_id: ModalFilter;
        offering_id: ModalFilter;
    }
    const [filterValuesFromModals, setFilterValuesFromModals] = useState<FilterValuesFromModals>({
        category_id: { name: "", id: "" },
        service_id: { name: "", id: "" },
        business_object_id: { name: "", id: "" },
        user_requesting_id: { name: "", id: "" },
        offering_id: { name: "", id: "" }
    });
    const [columnToFilter, setcolumnToFilter] = useState({ name: '', value: '' });
    const [categoryOrdering, setCategoryOrdering] = useState("");
    const [titleOrdering, setTitleOrdering] = useState("");
    const [createdOnOrdering, setCreatedOnOrdering] = useState("");
    const [userRequestingOrdering, setUserRequestingOrdering] = useState("");
    const [statusOrdering, setStatusOrdering] = useState("");
    const [isPushEnabled, setIsPushEnabled] = useState((window as any)["env"]["isPushEnabled"] ? "" : "data");
    function ChangingOrder_inside(stateToChange: any, columnToFilter: string) {
        switch (columnToFilter) {
            case "category": {
                setCategoryOrdering(ChangingOrder(categoryOrdering))
                setTitleOrdering("")
                setCreatedOnOrdering("")
                setUserRequestingOrdering("")
                setStatusOrdering("")
                setcolumnToFilter(prevState => ({
                    ...prevState,
                    name: "category",
                    value: categoryOrdering
                }));

                break;
            }
            case "title": {
                setTitleOrdering(ChangingOrder(titleOrdering))
                setCategoryOrdering("")
                setCreatedOnOrdering("")
                setUserRequestingOrdering("")
                setStatusOrdering("")
                setcolumnToFilter(prevState => ({
                    ...prevState,
                    name: "title",
                    value: titleOrdering
                }));

                break;
            }
            case "created_on": {
                setCreatedOnOrdering(ChangingOrder(createdOnOrdering))
                setCategoryOrdering("")
                setTitleOrdering("")
                setUserRequestingOrdering("")
                setStatusOrdering("")
                setcolumnToFilter(prevState => ({
                    ...prevState,
                    name: "created_on",
                    value: createdOnOrdering
                }));

                break;
            }
            case "user_requesting": {
                setUserRequestingOrdering(ChangingOrder(userRequestingOrdering))
                setCategoryOrdering("")
                setTitleOrdering("")
                setCreatedOnOrdering("")
                setStatusOrdering("")
                setcolumnToFilter(prevState => ({
                    ...prevState,
                    name: "user_requesting",
                    value: userRequestingOrdering
                }));

                break;
            }
            case "status": {
                setStatusOrdering(ChangingOrder(statusOrdering))
                setCategoryOrdering("")
                setTitleOrdering("")
                setCreatedOnOrdering("")
                setUserRequestingOrdering("")
                setcolumnToFilter(prevState => ({
                    ...prevState,
                    name: "status",
                    value: statusOrdering
                }));

                break;
            }

        }
    }
    useEffect(() => {
        if (id) {
            setFilterValuesFromModals(prevFilters => ({
                ...prevFilters,
                offering_id: { ...prevFilters.offering_id, id: id }
            }));
        }
    }, []);
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        fetchData();
    };
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFilterValues({ ...filterValues, [e.target.name]: e.target.value });

    };

    useEffect(() => {
        fetchData();
    }, [filterValuesFromModals, currentPage, expandedFiltersByLevel, isPushEnabled]);

    useEffect(() => {
        fetchFilters();
    }, [isPushEnabled]);
    const fetchFilters = async () => {
        try {
            const response = await axiosWithInterceptorInstance.get<IFilter[]>(API_URL_FILTERS);
            setFilters(response.data.filter(element => element.value !== null));
        } catch (error: unknown) {
            const axiosError = error as AxiosError

            console.error('Error fetching data:', error);
        }
    };

    const generateFilterQuery = () => {
        let query = '';
        let index = 0;
        const filterKeys: (keyof IFilterValues)[] = ['sqlf_10', 'title', 'sqlf_9', 'cf_profile_selector', 'cf_profile_description', 'sqlf_11', 'sqlf_12', 'cf_id', 'category', 'user_requesting', 'created_on', 'status', 'cf_comments'];

        filterKeys.forEach(key => {
            if (filterValues[key]) {
                if (index > 0) {
                    query += `&`;
                }
                query += `${encodeURIComponent(key)}=${encodeURIComponent(filterValues[key])}`;
                index++;
            }
        });

        for (let [key, value] of Object.entries(filterValuesFromModals)) {
            if (value.id) {
                if (key === "category_id") {
                    key = "data_catalog_category_id"
                }
                if (key === "service_id") {
                    key = "ft_service_id"
                }
                if (key === "business_object_id") {
                    key = "ft_business_object_id"
                } if (key === "offering_id") {
                    key = "ft_id_offering"
                } if (key === "user_requesting_id") {
                    key = "ft_owner_id"
                }
                if (index > 0) {
                    query += `&`;
                }
                query += `${encodeURIComponent(key)}=${encodeURIComponent(value.id)}`;
                index = index + 1;
                index++;
            }
        }
        return query;
    };
    const changeScenario = (isPushEnabled: string) => {

        setIsPushEnabled(isPushEnabled)

        clearActiveFilter()
        let modalFilters: string[] = ['category_id', 'serviceModal', 'business_object_id', 'offering_id', 'service_id', 'user_requesting_id']
        modalFilters.forEach((mf) => {
            cancelModalFilters(mf)
        }

        )

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
            const response = await axiosWithInterceptorInstance.get<{ listContent: ITableData[], totalPages: number, pageSize: number }>(`${API_URL_DATA}${currentPage - 1}?cf_type=${isPushEnabled}&${filter2Query}${filterQuery}&sel-sort-code=${columnToFilter.name}&sel-sort-order=${columnToFilter.value}`);
            setData(response.data.listContent);
            setTotalPages(response.data.totalPages);
            setPageSize(response.data.pageSize)
        } catch (error: unknown) {
            console.error('Error fetching data:');
        }
    };
    const paginate = (pageNumber: number): void => setCurrentPage(pageNumber);
    const toggleExpand = (filterKey: string, level: number, parrent: string) => {
        if (checkLevel(filterKey, expandedFiltersByLevel, parrent)) {
            clearActiveFilter()
        }
        setExpandedFiltersByLevel(prev => ({
            ...prev,
            [level]: prev[level] === filterKey ? null : filterKey
        }));
        setCurrentPage(1)
    };
    const renderButtonGroup = (filters: IFilter[], level = 0, parentKey = ''): JSX.Element[] => {
        return filters.map((filter, index) => {
            const filterKey = `${parentKey}${filter.code}-${filter.value}-${index}`;
            return (
                <div key={filterKey}>
                    <Button
                        variant="link"
                        onClick={() => toggleExpand(filter.value, level, filter?.parrent?.value)}
                    >
                        <div style={{ fontSize: '0.8rem', textAlign: "left" }}>
                            {expandedFiltersByLevel[level] === filter.value ? '-' : '+'} {filter.value}
                        </div>
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
        return representHierarchy() && (
            <div>
                <p style={{ display: 'inline' }}>Active Filters: <br></br> <b>{representHierarchy()}</b> <div style={{ display: 'inline-flex', scale: "0.6", marginLeft: '5px' }}>
                    <Button variant="outline-danger" onClick={clearActiveFilter}> <i className="fas fa-trash" style={{ color: 'red' }}></i> </Button>
                </div></p>
            </div>
        );
    };

    const clearActiveFilter = () => {
        setExpandedFiltersByLevel([]);
        setCurrentPage(1)
    };

    const cancelModalFilters = (modalName: string) => {
        setFilterValuesFromModals((prev) => ({
            ...prev,
            [modalName]: ""
        }));
        setCurrentPage(1);
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
        setCurrentPage(1)
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
                        <div style={{ padding: "15px" }}>
                            {renderActiveFilter()}
                        </div>
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
                                                Services
                                            </button>
                                            <input className="form-control" data-toggle="tooltip" data-placement="top" title={filterValuesFromModals.offering_id.name} placeholder={filterValuesFromModals.offering_id.name} aria-label="Example text with button addon" aria-describedby="button-addon1" />
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
                                            <input className="form-control" data-toggle="tooltip" data-placement="top" title={filterValuesFromModals.category_id.name} placeholder={filterValuesFromModals.category_id.name} aria-label="Example text with button addon" aria-describedby="button-addon1" />
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
                                                Cross platform services
                                            </button>
                                            <input className="form-control" data-toggle="tooltip" data-placement="top" title={filterValuesFromModals.service_id.name} placeholder={filterValuesFromModals.service_id.name} aria-label="Example text with button addon" aria-describedby="button-addon1" />
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
                                            <input className="form-control" data-toggle="tooltip" data-placement="top" title={filterValuesFromModals.business_object_id.name} placeholder={filterValuesFromModals.business_object_id.name} aria-label="Example text with button addon" aria-describedby="button-addon1" />
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
                                            <input className="form-control" data-toggle="tooltip" data-placement="top" title={filterValuesFromModals.user_requesting_id.name} placeholder={filterValuesFromModals.user_requesting_id.name} aria-label="Example text with button addon" aria-describedby="button-addon1" />
                                            <button onClick={() => cancelModalFilters('user_requesting_id')} className="btn btn-outline-secondary" type="button" id="button-addon1">
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
                                    <th style={{ textAlign: "center", verticalAlign: "middle" }}>Category <button className="btn btn-light text-end" onClick={() => ChangingOrder_inside(categoryOrdering, "category")} style={{ paddingLeft: "10 px", scale: "0.6" }} >
                                        {categoryOrdering === "desc" && <i className="fas fa-sort-up"></i>}{categoryOrdering === "asc" && <i className="fas fa-sort-down"></i>}{!categoryOrdering && <i className="fas fa-sort"></i>}
                                    </button></th>
                                    <th style={{ textAlign: "center", verticalAlign: "middle" }}>Title <button className="btn btn-light text-end" onClick={() => ChangingOrder_inside(titleOrdering, "title")} style={{ paddingLeft: "10 px", scale: "0.6" }} >
                                        {titleOrdering === "desc" && <i className="fas fa-sort-up"></i>}{titleOrdering === "asc" && <i className="fas fa-sort-down"></i>}{!titleOrdering && <i className="fas fa-sort"></i>}
                                    </button></th>
                                    <th style={{ textAlign: "center", verticalAlign: "middle" }}>User requesting <button className="btn btn-light text-end" onClick={() => ChangingOrder_inside(userRequestingOrdering, "user_requesting")} style={{ paddingLeft: "10 px", scale: "0.6" }} >
                                        {userRequestingOrdering === "desc" && <i className="fas fa-sort-up"></i>}{userRequestingOrdering === "asc" && <i className="fas fa-sort-down"></i>}{!userRequestingOrdering && <i className="fas fa-sort"></i>}
                                    </button></th>
                                    <th style={{ textAlign: "center", verticalAlign: "middle" }}>Status <button className="btn btn-light text-end" onClick={() => ChangingOrder_inside(statusOrdering, "status")} style={{ paddingLeft: "10 px", scale: "0.6" }} >
                                        {statusOrdering === "desc" && <i className="fas fa-sort-up"></i>}{statusOrdering === "asc" && <i className="fas fa-sort-down"></i>}{!statusOrdering && <i className="fas fa-sort"></i>}
                                    </button></th>
                                    <th style={{ textAlign: "center", verticalAlign: "middle" }}>Created On <button className="btn btn-light text-end" onClick={() => ChangingOrder_inside(createdOnOrdering, "created_on")} style={{ paddingLeft: "10 px", scale: "0.6" }} >
                                        {createdOnOrdering === "desc" && <i className="fas fa-sort-up"></i>}{createdOnOrdering === "asc" && <i className="fas fa-sort-down"></i>}{!createdOnOrdering && <i className="fas fa-sort"></i>}
                                    </button></th>
                                    <th style={{ textAlign: "center", verticalAlign: "middle" }}>Comments</th>
                                    <th style={{ textAlign: "center", verticalAlign: "middle" }}>Type</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td></td>
                                    <td></td>
                                    <td></td>
                                    <td><Form.Control /////////////////////////////
                                        type="text"
                                        name="title"
                                        placeholder="Filter"
                                        value={filterValues.title}
                                        onChange={handleInputChange}
                                    /></td>
                                    <td><Form.Control
                                        type="text"
                                        name="user_requesting"
                                        placeholder="Filter"
                                        value={filterValues.user_requesting}
                                        onChange={handleInputChange}
                                    /></td>


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
                                    <td>
                                        {(window as any)["env"]["isPushEnabled"] && <Dropdown drop='down' data-bs-toggle="tooltip" data-placement="top" title="Select the status of the services you want visualize">
                                            <Dropdown.Toggle id="dropdown-basic" >
                                                Select type: {isPushEnabled === "" && "any"} {isPushEnabled !== "" && isPushEnabled}
                                            </Dropdown.Toggle>
                                            <Dropdown.Menu>

                                                <Dropdown.Item onClick={() => changeScenario("")}>Any</Dropdown.Item>
                                                <Dropdown.Item >------</Dropdown.Item>
                                                <Dropdown.Item onClick={() => changeScenario("push")}>Push</Dropdown.Item>
                                                <Dropdown.Item onClick={() => changeScenario("data")}>Data</Dropdown.Item>
                                            </Dropdown.Menu>
                                        </Dropdown>}
                                    </td>

                                </tr>

                                {data.map((item, index) => (
                                    <tr key={index}>
                                        <th scope="row">{(((currentPage - 1)) * pageSize) + index + 1}</th>
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
                                        <td>{Inner(item.cf_type)}</td>
                                    </tr>
                                ))}
                            </tbody> 
                        </Table>
                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <Pagination totalPages={totalPages} paginate={paginate} currentPage={currentPage} />
                        </div>
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
                            <UserRequesting
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
