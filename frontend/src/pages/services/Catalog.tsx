import React, { useState, useEffect } from 'react';
import axios, { AxiosError } from 'axios';
import Button from 'react-bootstrap/Button';
import Table from 'react-bootstrap/Table';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, Row, Col, Form, Dropdown, Card } from 'react-bootstrap';
import Categories from '../modals/Categories';
import Service from '../modals/Service';
import BusinnesObject from '../modals/BusinnesObject';
import { EditService, RequestsOnService } from '@app/components/helpers/Buttons';
//import Truncate from 'react-truncate-string'
//import Truncate from 'react-truncate';
//import TextTruncate from 'react-text-truncate';
import Inner from '@app/components/helpers/InnerHtml';
import Pagination from '@app/components/helpers/Pagination';
import checkLevel from '@app/components/helpers/CheckLevel';
import { useDispatch } from 'react-redux';
import axiosWithInterceptorInstance from '@app/components/helpers/AxiosConfig';
import { ChangingOrder } from '@app/components/helpers/OrderingStateChange';
import { useLocation } from 'react-router-dom';
const API_URL_FILTERS = "datalist/left-grouping/my_catalog";
//const API_URL_DATA = "/datalist/my_push_offered_services/page/"; // utilizzato il nuovo solo xke nel vecchio mancano i campi type e url se si aggiungono in teoria dovrebbe funzionare lo stesso 
const API_URL_DATA = "/datalist/my_catalog/page/";
interface IFilterValues {
  created_by_username: string,
  title: string;
  created_on: string;
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
  category: string;
  cf_id: string;
  title: string;
  created_on: string;
  profile_selector: string;
  profile_description: string;
  status: string;
  subscriptions: string;
  service_id: string;
  cf_type: string;
  cf_push_uri: string;
  created_by_username: string;
}

const Catalog: React.FC = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const type = queryParams.get('type');
  const dispatch = useDispatch();
  const [data, setData] = useState<ITableData[]>([]);
  const [filters, setFilters] = useState<IFilter[]>([]);
  type ExpandedFiltersByLevel = { [level: number]: string | null };
  const [expandedFiltersByLevel, setExpandedFiltersByLevel] = useState<ExpandedFiltersByLevel>({});
  const [isPushEnabled, setIsPushEnabled] = useState( type==="push" ? "push" :  ((window as any)["env"]["isPushEnabled"] ? "" : "data")    ); //type==="push" ? true : false
  const [filterValues, setFilterValues] = useState<IFilterValues>({
    created_by_username: "",
    title: "",
    created_on: "",

  });
  const [modalStates, setModalStates] = useState({
    categoriesModal: false,
    serviceModal: false,
    BOModal: false
  });
  const [columnToFilter, setcolumnToFilter] = useState({ name: '', value: '' });
  const [categoryOrdering, setCategoryOrdering] = useState("");
  const [offeringOrdering, setofferingOrdering] = useState("");
  const [titleOrdering, setTitleOrdering] = useState("");
  const [createdOnOrdering, setCreatedOnOrdering] = useState("");
  function ChangingOrder_inside(stateToChange: any, columnToFilter: string) {
    switch (columnToFilter) {

      case "category": {
        setCategoryOrdering(ChangingOrder(categoryOrdering))
        setofferingOrdering("")
        setTitleOrdering("")
        setCreatedOnOrdering("")
        setcolumnToFilter(prevState => ({
          ...prevState,
          name: "category",
          value: categoryOrdering
        }));
        setCurrentPage(1)
        break;
      }
      case "created_by_username": {
        setofferingOrdering(ChangingOrder(offeringOrdering))
        setCategoryOrdering("")
        setTitleOrdering("")
        setCreatedOnOrdering("")
        setcolumnToFilter(prevState => ({
          ...prevState,
          name: "created_by_username",
          value: offeringOrdering
        }));
        setCurrentPage(1)
        break;
      }
      case "title": {
        setTitleOrdering(ChangingOrder(titleOrdering))
        setCategoryOrdering("")
        setofferingOrdering("")
        setCreatedOnOrdering("")
        setcolumnToFilter(prevState => ({
          ...prevState,
          name: "title",
          value: titleOrdering
        }));
        setCurrentPage(1)
        break;
      }
      case "created_on": {
        setCreatedOnOrdering(ChangingOrder(createdOnOrdering))
        setCategoryOrdering("")
        setofferingOrdering("")
        setTitleOrdering("")
        setcolumnToFilter(prevState => ({
          ...prevState,
          name: "created_on",
          value: createdOnOrdering
        }));
        setCurrentPage(1)
        break;
      }
    }
  }
  type ModalFilter = {
    name: string;
    id: string;
  }
  type FilterValuesFromModals = {
    category_id: ModalFilter;
    service_id: ModalFilter;
    business_object_id: ModalFilter;
  }
  const [filterValuesFromModals, setFilterValuesFromModals] = useState<FilterValuesFromModals>({
    category_id: { name: "", id: "" },
    service_id: { name: "", id: "" },
    business_object_id: { name: "", id: "" }

  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [pageSize, setPageSize] = useState(0);
  const [visibility, setVisibility] = useState(""); //type==="push" ? true : false


  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    fetchData();
  };
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilterValues({ ...filterValues, [e.target.name]: e.target.value });
    setCurrentPage(1)
  };

  useEffect(() => {
    /* if (type === "push" && visibility !== "push"){
      changeScenario("push")
    } */
    fetchData();
  }, [filterValuesFromModals, visibility, expandedFiltersByLevel, currentPage, isPushEnabled]);

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
    const filterKeys: (keyof IFilterValues)[] = ['created_by_username', 'title', 'created_on'];
    filterKeys.forEach(key => {
      if (filterValues[key]) {
        console.log(key, filterValues[key])
        if (index > 0) {
          query += `&`;
        }
        query += `${encodeURIComponent(key)}=${encodeURIComponent(filterValues[key])}`;
        index++;
      }
    });
    for (let [key, value] of Object.entries(filterValuesFromModals)) {
      if (value.id) {
        if (key === "business_object_id") {
          key = "filter_business_object_id"
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

  const changeScenario = (isPushEnabled: string) => {

    setIsPushEnabled(isPushEnabled)

    clearActiveFilter()
    let modalFilters: string[] = ['category_id', 'serviceModal', 'BOModal']
    modalFilters.forEach((mf) => {
      cancelModalFilters(mf)
    }

    )
    setVisibility(() => "")
  };

  const fetchData = async () => {
    try {
      let filterQuery = '';
      let filter2Query = generateFilterQuery();

      if (expandedFiltersByLevel[0]) {
        filterQuery = `&${encodeURIComponent("category_group")}=${encodeURIComponent(expandedFiltersByLevel[0])}`;
      }
      if (expandedFiltersByLevel[1]) {
        filterQuery = filterQuery + `&${encodeURIComponent("service_group")}=${encodeURIComponent(expandedFiltersByLevel[1])}`;
      }
      if (expandedFiltersByLevel[2]) {
        filterQuery = filterQuery + `&${encodeURIComponent("business_object_group")}=${encodeURIComponent(expandedFiltersByLevel[2])}`;
      }
      if (expandedFiltersByLevel[3]) {
        filterQuery = filterQuery + `&${encodeURIComponent("users_group")}=${encodeURIComponent(expandedFiltersByLevel[3])}`;
      }
      //let response;
      const response = await axiosWithInterceptorInstance.get<{ listContent: ITableData[], totalPages: number, pageSize: number }>(`${API_URL_DATA}${currentPage - 1}?cf_type=${isPushEnabled}&${filter2Query}${filterQuery}&ft_status=${visibility}&sel-sort-code=${columnToFilter.name}&sel-sort-order=${columnToFilter.value}`);

      setData(response.data.listContent);
      setTotalPages(response.data.totalPages);
      setPageSize(response.data.pageSize)
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

  const handleModalDataChange = (modalName: string, value: ModalFilter) => {
    setFilterValuesFromModals({ ...filterValuesFromModals, [modalName]: value });
    setCurrentPage(1)
  };
  const handleVisibility = (choice: number) => {
    if (choice === 1) {
      setVisibility("");
    } else if (choice === 2) {
      setVisibility("active");
    } else if (choice === 3) {
      setVisibility("disabled");
    }
  };


  return (
    <Container fluid >
      <div className='row' >
        <div className='col-11'>
          <h2> <i className="fas fa-layer-group nav-icon" style={{ paddingRight: "8px" }}> </i> <b>Catalog</b></h2>
          <h5>Navigate the catalog</h5>
        </div>

        <div className='col'>
          {/*  <Button onClick={() => New()} className="btn btn-success" data-bs-toggle="tooltip" data-placement="top" title="Create a new offered service" >
            New   <i className="fa fa-plus"></i>
          </Button> */}
        </div>

      </div>


      <Row style={{ paddingTop: "30px", flexWrap: "nowrap", display: "flex" }}>
        <Col md={2} style={{ display: 'flex', flexDirection: 'column' }}>

          <Card>
            <h5 style={{ paddingLeft: "10px", paddingTop: "10px", paddingRight: "10px" }}><b>Services Categorization</b></h5>
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
                    <div className="input-group " style={{ transform: "scale(0.8)" }}>
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
                    <div className="input-group " style={{ transform: "scale(0.8)" }}>
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
                    <div className="input-group " style={{ transform: "scale(0.8)" }}>
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
              </tbody>
            </table>
          </Card>
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
                  <th style={{ textAlign: "center", verticalAlign: "middle" }}>User Offering <button className="btn btn-light text-end" onClick={() => ChangingOrder_inside(offeringOrdering, "created_by_username")} style={{ paddingLeft: "10 px", scale: "0.6" }} >
                    {offeringOrdering === "desc" && <i className="fas fa-sort-up"></i>}{offeringOrdering === "asc" && <i className="fas fa-sort-down"></i>}{!offeringOrdering && <i className="fas fa-sort"></i>}
                  </button></th>
                  <th style={{ textAlign: "center", verticalAlign: "middle" }}>Title <button className="btn btn-light text-end" onClick={() => ChangingOrder_inside(titleOrdering, "title")} style={{ paddingLeft: "10 px", scale: "0.6" }} >
                    {titleOrdering === "desc" && <i className="fas fa-sort-up"></i>}{titleOrdering === "asc" && <i className="fas fa-sort-down"></i>}{!titleOrdering && <i className="fas fa-sort"></i>}
                  </button></th>
                  <th style={{ textAlign: "center", verticalAlign: "middle" }}>Created On <button className="btn btn-light text-end" onClick={() => ChangingOrder_inside(createdOnOrdering, "created_on")} style={{ paddingLeft: "10 px", scale: "0.6" }} >
                    {createdOnOrdering === "desc" && <i className="fas fa-sort-up"></i>}{createdOnOrdering === "asc" && <i className="fas fa-sort-down"></i>}{!createdOnOrdering && <i className="fas fa-sort"></i>}
                  </button></th>

                  <th style={{ textAlign: "center", verticalAlign: "middle" }}>Status</th>
                  <th style={{ textAlign: "center", verticalAlign: "middle" }}>Subscriptions</th>
                  <th style={{ textAlign: "center", verticalAlign: "middle" }}>Type</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td><Form.Control
                    type="text"
                    name="created_by_username"
                    placeholder="Filter"
                    value={filterValues.created_by_username}
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
                    name="created_on"
                    placeholder="Filter"
                    value={filterValues.created_on}
                    onChange={handleInputChange}
                  /></td>



                  <td><Dropdown drop='down' data-bs-toggle="tooltip" data-placement="down" title="Select the status of the services you want visualize">
                    <Dropdown.Toggle id="dropdown-basic" >
                      Service status: {visibility} {(visibility === "") && "any"}
                    </Dropdown.Toggle>

                    <Dropdown.Menu>
                      <Dropdown.Item >------</Dropdown.Item>
                      <Dropdown.Item onClick={() => handleVisibility(1)}>Any</Dropdown.Item>
                      <Dropdown.Item onClick={() => handleVisibility(2)}>Active</Dropdown.Item>
                      <Dropdown.Item onClick={() => handleVisibility(3)}>Disabled</Dropdown.Item>

                    </Dropdown.Menu>
                  </Dropdown></td>

                  <td></td>
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
                      <div className='row d-flex flex-nowrap'>
                        <div className='col'>
                          <Button variant="outline-light" className="btn btn-primary" onClick={() => EditService(item.cf_id, "catalog")} data-bs-toggle="tooltip" data-placement="top" title="Edit your offered service">
                            <i className="fas fa-pencil-alt"></i>
                          </Button></div>
                        <div className='col'>
                          <Button variant="outline-light" className="btn btn-primary" onClick={() => RequestsOnService(item.cf_id)} data-bs-toggle="tooltip" data-placement="top" title="View your offered service's requests">
                            <i className="fas fa-handshake"></i>

                          </Button></div>
                      </div>
                    </td>

                    <td dangerouslySetInnerHTML={{ __html: item.category }}></td>
                    <td dangerouslySetInnerHTML={{ __html: item.created_by_username }}></td>
                    <td>{item.title}</td>
                    <td>{item.created_on}</td>
                    <td>{Inner(item.status)}</td>
                    <td>
                      <div style={{
                        display: '-webkit-box',
                        WebkitLineClamp: 3, 
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'normal'
                      }}>
                        <span dangerouslySetInnerHTML={{ __html: item.subscriptions }} data-bs-toggle="tooltip" data-placement="top" title={Inner(item.subscriptions)}/>

                      </div>
                    </td>

                    {/* <td
                      dangerouslySetInnerHTML={{ __html: item.subscriptions }}
                      style={{
                        overflow: 'hidden',
                        whiteSpace: 'nowrap',
                        textOverflow: 'ellipsis',
                        maxHeight: '1px', 
                        
                      }} data-bs-toggle="tooltip" data-placement="top" title={Inner(item.subscriptions)}
                    />  */}
                    {/*  <td style={{
                        overflow: 'hidden',
                        whiteSpace: 'nowrap',
                        textOverflow: 'ellipsis',
                        maxWidth: '20px', 
                      }} data-bs-toggle="tooltip" data-placement="top" title={Inner(item.subscriptions)}>{Inner(item.subscriptions)}</td> */}

                    <td>{Inner(item.cf_type)}</td>
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

            <Button type="submit" style={{ display: 'none' }}>Invia</Button>

          </Form>
        </Col>
      </Row>
    </Container>
  );
};

export default Catalog;
