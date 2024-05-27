import React, { useState, useEffect } from 'react';
import axios, { AxiosError } from 'axios';
import Button from 'react-bootstrap/Button';
import Table from 'react-bootstrap/Table';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, Row, Col, Form, Card } from 'react-bootstrap';
import Categories from '../modals/Categories';
import Service from '../modals/Service';
import BusinnesObject from '../modals/BusinnesObject';
import { EditSubscription } from '@app/components/helpers/Buttons';
import UserRequesting from '../modals/Userequesting';
import Pagination from '@app/components/helpers/Pagination';
import { NewSubscription } from '@app/components/helpers/Buttons';
import { format } from 'date-fns';
import checkLevel from '@app/components/helpers/CheckLevel';
import axiosWithInterceptorInstance from '@app/components/helpers/AxiosConfig';
import { ChangingOrder } from '@app/components/helpers/OrderingStateChange';
const API_URL_FILTERS = "/datalist/left-grouping/my_subscriptions";
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
    parrent: IFilter;
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
    category_name: string;
    created_on: string;
    sqlf_8: string;
    status: string;
    comments: string;
    user_offering: string;
    totalPages: string;
    my_subscription_id: string;
    category_code: string;
}
const MySubscriptions: React.FC = () => {
    const [data, setData] = useState<ITableData[]>([]);
    const [filters, setFilters] = useState<IFilter[]>([]);
    type ExpandedFiltersByLevel = { [level: number]: string | null };
    const [expandedFiltersByLevel, setExpandedFiltersByLevel] = useState<ExpandedFiltersByLevel>({});
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

    type FilterValuesFromModals = {
        category_id: ModalFilter;
        service_id: ModalFilter;
        business_object_id: ModalFilter;
        user_requesting_id: ModalFilter;

    }

    const [filterValuesFromModals, setFilterValuesFromModals] = useState<FilterValuesFromModals>({
        category_id: { name: "", id: "" },
        service_id: { name: "", id: "" },
        business_object_id: { name: "", id: "" },
        user_requesting_id: { name: "", id: "" },


    });
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [columnToFilter, setcolumnToFilter] = useState({ name: '', value: '' });
    const [categoryOrdering, setCategoryOrdering] = useState("");
    const [titleOrdering, setTitleOrdering] = useState("");
    const [createdOnOrdering, setCreatedOnOrdering] = useState("");
    const [profileFormatOrdering, setProfileFormatOrdering] = useState("");
    const [profileDescriptionOrdering, setProfileDescriptionOrdering] = useState("");
    function ChangingOrder_inside(stateToChange: any, columnToFilter: string) {
        switch (columnToFilter) {
            case "category": {
                setCategoryOrdering(ChangingOrder(categoryOrdering))
                setTitleOrdering("")
                setCreatedOnOrdering("")
                setProfileFormatOrdering("")
                setProfileDescriptionOrdering("")
                setcolumnToFilter(prevState => ({
                    ...prevState,
                    name: "category_name",
                    value: categoryOrdering
                }));

                break;
            }
            case "title": {
                setTitleOrdering(ChangingOrder(titleOrdering))
                setCategoryOrdering("")
                setCreatedOnOrdering("")
                setProfileFormatOrdering("")
                setProfileDescriptionOrdering("")
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
                setProfileFormatOrdering("")
                setProfileDescriptionOrdering("")
                setcolumnToFilter(prevState => ({
                    ...prevState,
                    name: "created_on",
                    value: createdOnOrdering
                }));

                break;
            }
            case "profile_selector": {
                setProfileFormatOrdering(ChangingOrder(profileFormatOrdering))
                setCategoryOrdering("")
                setTitleOrdering("")
                setCreatedOnOrdering("")
                setProfileDescriptionOrdering("")
                setcolumnToFilter(prevState => ({
                    ...prevState,
                    name: "profile_selector",
                    value: profileFormatOrdering
                }));

                break;
            }
            case "profile_description": {
                setProfileDescriptionOrdering(ChangingOrder(profileDescriptionOrdering))
                setCategoryOrdering("")
                setTitleOrdering("")
                setCreatedOnOrdering("")
                setProfileFormatOrdering("")
                setcolumnToFilter(prevState => ({
                    ...prevState,
                    name: "profile_description",
                    value: profileDescriptionOrdering
                }));

                break;
            }

        }
    }
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        fetchData();
    };
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const key = e.target.name as keyof IFilterValues;
        const value = e.target.value;
        setFilterValues(prevState => ({ ...prevState, [key]: value }));
        setCurrentPage(1)
    };

    useEffect(() => {
        fetchData();
    }, [filterValuesFromModals, expandedFiltersByLevel, currentPage]);

    useEffect(() => {
        fetchFilters();
    }, []);

    const fetchFilters = async () => {
        try {
            const response = await axiosWithInterceptorInstance.get<IFilter[]>(API_URL_FILTERS);
            setFilters(response.data.filter(element => element.value !== null));
        } catch (error) {
            console.error('Error fetching filters:', error);
        }
    };

    const generateFilterQuery = () => {
        let query = '';
        let index = 0;
        const filterKeys: (keyof IFilterValues)[] = ['sqlf_10', 'title', 'sqlf_9', 'profile_selector', 'profile_description', 'sqlf_11', 'sqlf_12', 'cf_id', 'category', 'created_on', 'sqlf_8', 'status', 'comments', 'user_offering'];

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
                if (key === "user_requesting_id") {
                    key = "user_offering_id"
                }
                if (index > 0) {
                    query += `&`;

                }
                query += `${encodeURIComponent(key)}=${encodeURIComponent(value.id)}`;
                index++;
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

            const response = await axiosWithInterceptorInstance.get<{ listContent: ITableData[], totalPages: number }>(`${API_URL_DATA}${currentPage - 1}?${filter2Query}${filterQuery}&sel-sort-code=${columnToFilter.name}&sel-sort-order=${columnToFilter.value}`);
            setData(response.data.listContent);
            setTotalPages(response.data.totalPages);
        } catch (error: unknown) {
            console.error('Error fetching data:', error);
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
        setFilterValuesFromModals({
            ...filterValuesFromModals,
            [modalName]: ""
        });
        setCurrentPage(1)
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
            <Row style={{ paddingTop: "30px", flexWrap: "nowrap", display: "flex" }}>
                <Col md={2} style={{ display: 'flex', flexDirection: 'column' }}>
                    <Card>
                        <h5 style={{ paddingLeft: "10px", paddingTop: "10px" }}><b> Categorization </b></h5>
                        <h6 style={{ padding: "10px" }}>Navigate & Filter Data Requests by Category, Service, Business Object & User categorization tree</h6>
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
                                                Service
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
                                                Offering owner
                                            </button>
                                            <input className="form-control" data-toggle="tooltip" data-placement="top" title={filterValuesFromModals.user_requesting_id.name} placeholder={filterValuesFromModals.user_requesting_id.name} aria-label="Example text with button addon" aria-describedby="button-addon1" />
                                            <button onClick={() => cancelModalFilters('user_requesting_id')} className="btn btn-outline-secondary" type="button" id="button-addon1">
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
                                    <th style={{ textAlign: "center", verticalAlign: "middle" }}>Category <button className="btn btn-light text-end" onClick={() => ChangingOrder_inside(categoryOrdering, "category")} style={{ paddingLeft: "10 px", scale: "0.6" }} >
                                        {categoryOrdering === "desc" && <i className="fas fa-sort-up"></i>}{categoryOrdering === "asc" && <i className="fas fa-sort-down"></i>}{!categoryOrdering && <i className="fas fa-sort"></i>}
                                    </button></th>
                                    <th style={{ textAlign: "center", verticalAlign: "middle" }}>Title <button className="btn btn-light text-end" onClick={() => ChangingOrder_inside(titleOrdering, "title")} style={{ paddingLeft: "10 px", scale: "0.6" }} >
                                        {titleOrdering === "desc" && <i className="fas fa-sort-up"></i>}{titleOrdering === "asc" && <i className="fas fa-sort-down"></i>}{!titleOrdering && <i className="fas fa-sort"></i>}
                                    </button></th>
                                    <th style={{ textAlign: "center", verticalAlign: "middle" }}>Status</th>
                                    <th style={{ textAlign: "center", verticalAlign: "middle" }}>Created On <button className="btn btn-light text-end" onClick={() => ChangingOrder_inside(createdOnOrdering, "created_on")} style={{ paddingLeft: "10 px", scale: "0.6" }} >
                                        {createdOnOrdering === "desc" && <i className="fas fa-sort-up"></i>}{createdOnOrdering === "asc" && <i className="fas fa-sort-down"></i>}{!createdOnOrdering && <i className="fas fa-sort"></i>}
                                    </button></th>
                                    <th style={{ textAlign: "center", verticalAlign: "middle" }}>Comments</th>
                                    <th style={{ textAlign: "center", verticalAlign: "middle" }}>Profile Format <button className="btn btn-light text-end" onClick={() => ChangingOrder_inside(profileFormatOrdering, "profile_selector")} style={{ paddingLeft: "10 px", scale: "0.6" }} >
                    {profileFormatOrdering === "desc" && <i className="fas fa-sort-up"></i>}{profileFormatOrdering === "asc" && <i className="fas fa-sort-down"></i>}{!profileFormatOrdering && <i className="fas fa-sort"></i>}
                  </button></th>
                  <th style={{textAlign: "center", verticalAlign: "middle", maxWidth: "1px", wordBreak: 'break-word' }}>Profile Description  <button className="btn btn-light text-end" onClick={() => ChangingOrder_inside(profileDescriptionOrdering, "profile_description")} style={{ paddingLeft: "10 px", scale: "0.6" }} >
                    {profileDescriptionOrdering === "desc" && <i className="fas fa-sort-up"></i>}{profileDescriptionOrdering === "asc" && <i className="fas fa-sort-down"></i>}{!profileDescriptionOrdering && <i className="fas fa-sort"></i>}
                  </button></th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td></td>
                                    <td></td>
                                    <td></td>
                                    <td>{/* <Form.Control
                                        type="text"
                                        name="title"
                                        placeholder="Filter"
                                        value={filterValues.title}
                                        onChange={handleInputChange}
                                    /> */}</td>
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
                                        <td>{item.category_code + " - " + item.category_name}</td>
                                        <td>{item.title}</td>
                                        {/* <td>{item.user_offering}</td>  */}
                                        <td>{item.status}</td>
                                        <td>{format(new Date(item.created_on), 'dd/MM/yyyy HH:mm')}</td>
                                        <td>{item.comments}</td>
                                        <td>{item.profile_selector}</td>
                                        <td style={{
                                            maxWidth: "180px",
                                            whiteSpace: "nowrap",
                                            overflow: "hidden",
                                            textOverflow: "ellipsis"
                                        }} data-toggle="tooltip" data-placement="top" title={item.profile_description}>{item.profile_description}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
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
