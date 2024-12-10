import React, { useState, useEffect } from 'react';
import axios, { AxiosError } from 'axios';
import Button from 'react-bootstrap/Button';
import Table from 'react-bootstrap/Table';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, Row, Col, Form, Card } from 'react-bootstrap';
import Categories from '../modals/Categories';
import Service from '../modals/Service';
import UserRequesting from '../modals/Userequesting';
import BusinnesObject from '../modals/BusinnesObject';
import { DetailDataEntity } from '@app/components/helpers/Buttons';
import Pagination from '@app/components/helpers/Pagination';
import { format } from 'date-fns';
import checkLevel from '@app/components/helpers/CheckLevel';
import axiosWithInterceptorInstance from '@app/components/helpers/AxiosConfig';
import { ChangingOrder } from '@app/components/helpers/OrderingStateChange';
const API_URL_FILTERS = "/datalist/left-grouping/data_consumed";
const API_URL_DATA = "/datalist/data_consumed/page/";
const API_URL_DATA_PUSH = "/datalist/push_data_consumed/page/";
interface IFilterValues {
  data_catalog_category_name: string;
  id: string;
  title: string;
  created_on: string;
  profile_selector: string;
  data_description: string;
  status: string;
  subscriptions: string;
  file_name: string;
  provider_username: string;
  data_title: string;
  offering_title:string;
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
  data_catalog_category_name: string;
  data_catalog_service_code: string;
  id: string;
  title: string;
  created_on: string;
  profile_selector: string;
  data_description: string;
  status: string;
  subscriptions: string;
  file_name: string;
  provider_username: string;
  data_title: string;
  offering_title: string;
}

const ConsumeData: React.FC = () => {
  const [data, setData] = useState<ITableData[]>([]);
  const [filters, setFilters] = useState<IFilter[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  type ExpandedFiltersByLevel = { [level: number]: string | null };
  const [expandedFiltersByLevel, setExpandedFiltersByLevel] = useState<ExpandedFiltersByLevel>({});
  const [isPushEnabled, setIsPushEnabled] = useState(false);
  const [filterValues, setFilterValues] = useState<IFilterValues>({
    data_catalog_category_name: "",
    id: "",
    title: "",
    created_on: "",
    profile_selector: "",
    data_description: "",
    status: "",
    subscriptions: "",
    file_name: "",
    provider_username: "",
    data_title: "",
    offering_title:""
  });

  const [modalStates, setModalStates] = useState({
    categoriesModal: false,
    serviceModal: false,
    BOModal: false,
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
  const [columnToFilter, setcolumnToFilter] = useState({ name: '', value: '' });
  const [categoryOrdering, setCategoryOrdering] = useState("");
  const [titleOrdering, setTitleOrdering] = useState("");
  const [createdOnOrdering, setCreatedOnOrdering] = useState("");
  const [userOfferingOrdering, setUserOfferingOrdering] = useState("");
  const [dataTitleOrdering, setDataTitleOrdering] = useState("");
  function ChangingOrder_inside(stateToChange: any, columnToFilter: string) {
    switch (columnToFilter) {
      case "category": {
        setCategoryOrdering(ChangingOrder(categoryOrdering))
        setTitleOrdering("")
        setCreatedOnOrdering("")
        setUserOfferingOrdering("")
        setDataTitleOrdering("")
        setcolumnToFilter(prevState => ({
          ...prevState,
          name: "data_catalog_category_name",
          value: categoryOrdering
        }));

        break;
      }
      case "title": {
        setTitleOrdering(ChangingOrder(titleOrdering))
        setCategoryOrdering("")
        setCreatedOnOrdering("")
        setUserOfferingOrdering("")
        setDataTitleOrdering("")
        setcolumnToFilter(prevState => ({
          ...prevState,
          name: "offering_title",
          value: titleOrdering
        }));

        break;
      }
      case "created_on": {
        setCreatedOnOrdering(ChangingOrder(createdOnOrdering))
        setCategoryOrdering("")
        setTitleOrdering("")
        setUserOfferingOrdering("")
        setDataTitleOrdering("")
        setcolumnToFilter(prevState => ({
          ...prevState,
          name: "created_on",
          value: createdOnOrdering
        }));

        break;
      }
      case "provider_username": {
        setUserOfferingOrdering(ChangingOrder(userOfferingOrdering))
        setCategoryOrdering("")
        setTitleOrdering("")
        setCreatedOnOrdering("")
        setDataTitleOrdering("")
        setcolumnToFilter(prevState => ({
          ...prevState,
          name: "provider_username",
          value: userOfferingOrdering
        }));

        break;
      }
      case "data_title": {
        setDataTitleOrdering(ChangingOrder(dataTitleOrdering))
        setCategoryOrdering("")
        setTitleOrdering("")
        setCreatedOnOrdering("")
        setUserOfferingOrdering("")
        setcolumnToFilter(prevState => ({
          ...prevState,
          name: "data_title",
          value: dataTitleOrdering
        }));

        break;
      }

    }
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    fetchData(); setCurrentPage(1)
  };
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilterValues({ ...filterValues, [e.target.name]: e.target.value });
    setCurrentPage(1)
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
    } catch (error) {
      console.error('Error fetching filters:', error);
    }
  };

  const generateFilterQuery = () => {
    let query = '';
    let index = 0;
    const filterKeys: (keyof IFilterValues)[] = ['data_catalog_category_name', 'title', 'created_on', 'profile_selector', 'data_description', 'status', 'subscriptions', 'file_name', 'provider_username', 'data_title', 'offering_title'];

    filterKeys.forEach(key => {
      if (filterValues[key]) {
        if (index > 0) {
          query += `&`;
        }
        query += `${encodeURIComponent(key)}=${encodeURIComponent(filterValues[key])}`;
        index++;
      }
    });
    // modali
    for (let [key, value] of Object.entries(filterValuesFromModals)) {
      if (value.id) {

        if (key === "category_id") {
          key = "data_catalog_category_id"
        }
        if (key === "service_id") {
          key = "ft_service_id"
        }
        if (key === "business_object_id") {
          key = "data_catalog_business_object_id"
        }
        if (key === "user_requesting_id") {
          key = "provider_id"
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

  const changeScenario = (isPushEnabled: boolean) => {

    setIsPushEnabled(isPushEnabled)

    /* if (isPushEnabled) {
      setIsPushEnabled(() => false)
    } else { //is not a push scenario, we would like to enable it
      if ((window as any)["env"]["isPushEnabled"]) { //Just a check that we can enable it
        setIsPushEnabled(() => true)
      }
    } */
    //setCurrentPage(() => 0)
    clearActiveFilter()
    let modalFilters: string[] = ['category_id', 'serviceModal', 'BOModal']
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
      //console.log("url")
      //console.log(API_URL_DATA + "?service_type=push&ft_created_by=" + localStorage.getItem("uid"))
      // const response = await axiosWithInterceptorInstance.get<{ listContent: ITableData[], totalPages: number }>(`${API_URL_DATA}${currentPage - 1}?${filter2Query}${filterQuery}&sel-sort-code=${columnToFilter.name}&sel-sort-order=${columnToFilter.value}`);
      /* const response = await axiosWithInterceptorInstance.get<{ listContent: ITableData[], totalPages: number }>(API_URL_DATA + (currentPage - 1) + "?service_type=push&ft_created_by=" + localStorage.getItem("uid"));
      setData(response.data.listContent);
      setTotalPages(response.data.totalPages); */

      if (isPushEnabled) {
        const response = await axiosWithInterceptorInstance.get<{ listContent: ITableData[], totalPages: number }>(API_URL_DATA_PUSH + (currentPage - 1) + `?service_type=push&sel-sort-code=${columnToFilter.name}&sel-sort-order=${columnToFilter.value}&${filter2Query}${filterQuery}&ft_created_by=` + localStorage.getItem("uid"));
        setData(response.data.listContent);
        setTotalPages(response.data.totalPages);
        //setPageSize(response.data.pageSize)
      } else {
        const response = await axiosWithInterceptorInstance.get<{ listContent: ITableData[], totalPages: number }>(API_URL_DATA + (currentPage - 1) + `?service_type=&sel-sort-code=${columnToFilter.name}&sel-sort-order=${columnToFilter.value}&${filter2Query}${filterQuery}&ft_created_by=` + localStorage.getItem("uid"));
        setData(response.data.listContent);
        setTotalPages(response.data.totalPages);
        //setPageSize(response.data.pageSize)
      }
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
      <h2> <i className="fas fa-external-link-alt nav-icon" style={{ paddingRight: "8px" }}> </i> <b>Consume Data</b></h2>
      <h5>Navigate to Data that you Received by Category, Service& Business Object.</h5>
      <Row style={{ paddingTop: "30px", flexWrap: "nowrap", display: "flex" }}>
        <Col md={2} style={{ display: 'flex', flexDirection: 'column' }}>

          <Card>
            <h5 style={{ paddingLeft: "10px", paddingTop: "10px" }}><b>Offered Services Categorization</b></h5>
            <h6 style={{ padding: "10px" }}>Navigate & Filter Data Offerings by Category, Service, Business Object & User categorization tree </h6>
            {renderButtonGroup(filters)}
            <div style={{ padding: "15px" }}>
              {renderActiveFilter()}
            </div>
          </Card>
          <Card>
            <h5 style={{ paddingLeft: "10px", paddingTop: "10px" }}><b>Filters</b></h5>
            <h6 style={{ padding: "10px" }}>Select & Refine Seach </h6>
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
                      <button onClick={() => handleOpenModal('BOModal')} className="btn btn-outline-secondary" type="button" id="button-addon1">
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
                        File owner
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
        <Col >
          <Form onSubmit={handleSubmit}>
            <ul className="nav nav-tabs">

              {!isPushEnabled && <li className="nav-item">
                <a className="nav-link active " href="#" onClick={() => changeScenario(false)} >Data</a>
              </li>}
              {isPushEnabled && <li className="nav-item">
                <a className="nav-link " href="#" onClick={() => changeScenario(false)} >Data</a>
              </li>}
              {(window as any)["env"]["isPushEnabled"] && !isPushEnabled && <li className="nav-item">
                <a className="nav-link " aria-current="page" href="#" onClick={() => changeScenario(true)} >Push</a>
              </li>}
              {(window as any)["env"]["isPushEnabled"] && isPushEnabled && <li className="nav-item">
                <a className="nav-link active" aria-current="page" href="#" onClick={() => changeScenario(true)} >Push</a>
              </li>}
            </ul>
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
                  <th style={{ textAlign: "center", verticalAlign: "middle" }}>User Offering <button className="btn btn-light text-end" onClick={() => ChangingOrder_inside(userOfferingOrdering, "provider_username")} style={{ paddingLeft: "10 px", scale: "0.6" }} >
                    {userOfferingOrdering === "desc" && <i className="fas fa-sort-up"></i>}{userOfferingOrdering === "asc" && <i className="fas fa-sort-down"></i>}{!userOfferingOrdering && <i className="fas fa-sort"></i>}
                  </button></th>
                  <th style={{ textAlign: "center", verticalAlign: "middle" }}>Created On <button className="btn btn-light text-end" onClick={() => ChangingOrder_inside(createdOnOrdering, "created_on")} style={{ paddingLeft: "10 px", scale: "0.6" }} >
                    {createdOnOrdering === "desc" && <i className="fas fa-sort-up"></i>}{createdOnOrdering === "asc" && <i className="fas fa-sort-down"></i>}{!createdOnOrdering && <i className="fas fa-sort"></i>}
                  </button></th>
                  <th style={{ textAlign: "center", verticalAlign: "middle" }}>Data Title <button className="btn btn-light text-end" onClick={() => ChangingOrder_inside(dataTitleOrdering, "data_title")} style={{ paddingLeft: "10 px", scale: "0.6" }} >
                    {dataTitleOrdering === "desc" && <i className="fas fa-sort-up"></i>}{dataTitleOrdering === "asc" && <i className="fas fa-sort-down"></i>}{!dataTitleOrdering && <i className="fas fa-sort"></i>}
                  </button></th>
                  <th style={{ textAlign: "center", verticalAlign: "middle" }}>Description</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td></td>
                  <td></td>
                  <td></td>

                  <td><Form.Control
                    type="text"
                    name="offering_title"
                    placeholder="Filter"
                    value={filterValues.offering_title}
                    onChange={handleInputChange}
                  /></td>

                  <td><Form.Control
                    type="text"
                    name="provider_username"
                    placeholder="Filter"
                    value={filterValues.provider_username}
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
                    name="data_title"
                    placeholder="Filter"
                    value={filterValues.data_title}
                    onChange={handleInputChange}
                  /></td>
                  <td><Form.Control
                    type="text"
                    name="data_description"
                    placeholder="Filter"
                    value={filterValues.data_description}
                    onChange={handleInputChange}
                  /></td>
                </tr>

                {data.map((item, index) => (
                  <tr key={index}>
                    <th scope="row">{(((currentPage - 1)) * 10) + index + 1}</th>
                    <td>
                      <div className='row'>
                        <Button variant="outline-light" className="btn btn-primary" onClick={() => DetailDataEntity(item?.id)} data-toggle="tooltip" data-placement="top" title="View data details">
                          <i className="fas fa-search"></i>
                        </Button>

                      </div>
                    </td>

                    <td>{item.data_catalog_service_code + " -  " + item.data_catalog_category_name}</td>
                    <td>{item.offering_title}</td>
                    <td>{item.provider_username}</td>
                    <td>{format(new Date(item.created_on), 'dd/MM/yyyy HH:mm')}</td>
                    <td>{item.data_title}</td>
                    <td>{item.data_description}</td>

                  </tr>
                ))}
              </tbody>
            </Table>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Pagination totalPages={totalPages} paginate={paginate} currentPage={currentPage} />
            </div>
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
            {modalStates.BOModal && (
              <BusinnesObject
                show={modalStates.BOModal}
                handleClose={() => handleCloseModal('BOModal')}
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

export default ConsumeData;
