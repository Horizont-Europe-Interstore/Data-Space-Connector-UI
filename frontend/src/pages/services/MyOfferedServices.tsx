import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Button from 'react-bootstrap/Button';
import Table from 'react-bootstrap/Table';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, Row, Col, Form, Dropdown, Card } from 'react-bootstrap';
import Categories from '../modals/Categories';
import Service from '../modals/Service';
import BusinnesObject from '../modals/BusinnesObject';
import { EditService, RequestedServices } from '@app/components/helpers/Buttons';
import { New } from '@app/components/helpers/Buttons';
import Inner from '@app/components/helpers/InnerHtml';
import Pagination from '@app/components/helpers/Pagination';
if (localStorage.getItem("token")) {
  axios.defaults.headers.common["Authorization"] = `Bearer ${localStorage.getItem("token")}`;
}
const API_URL_FILTERS = "/list/left-grouping/results?id=4631baf0-32b0-444c-a031-4947578f37f8&ft_status=active&language-id=2";
const API_URL_DATA = "/datalist/my_offered_services/page/";
interface PaginationProps {
  totalPages: number;
  paginate: (pageNumber: number) => void;
  currentPage: number;
  pageSize: number;
}
interface IFilterValues {
  category: string;
  cf_id: string;
  title: string;
  created_on: string;
  profile_selector: string;
  profile_description: string;
  status: string;
  subscriptions: string;
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
  category: string;
  cf_id: string;
  title: string;
  created_on: string;
  profile_selector: string;
  profile_description: string;
  status: string;
  subscriptions: string;
  service_id: string;

}
const MyOfferedServices: React.FC = () => {
  const [data, setData] = useState<ITableData[]>([]);
  const [filters, setFilters] = useState<IFilter[]>([]);
  const [activeFilter, setActiveFilter] = useState<{ parentCode: string, parentValue: string, code: string, value: string } | null>(null);
  const [expandedFilter, setExpandedFilter] = useState<string | null>(null);
  const [PartialApi, setPartialApi] = useState<string | null>(null);
  const [showCategoriesModal, setShowCategoriesModal] = useState(false);
  const [renderCategoriesModal, setRenderCategoriesModal] = useState(false);
  const [filterValues, setFilterValues] = useState<IFilterValues>({
    category: "",
    cf_id: "",
    title: "",
    created_on: "",
    profile_selector: "",
    profile_description: "",
    status: "",
    subscriptions: ""
  });

  const [modalStates, setModalStates] = useState({
    categoriesModal: false,
    serviceModal: false,
    BOModal: false
    //anotherModal: false,

  });

  const [filterValuesFromModals, setFilterValuesFromModals] = useState({
    ft_id: "",
    ft_id2: "",
    catalog_business_object_id: ""

  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [pageSize, setPageSize] = useState(0);
  const itemsPerPage = 10;
  const [visibility, setVisibility] = useState("");
  useEffect(() => {
    fetchData();
  }, [currentPage]);
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    fetchData();
  };
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilterValues({ ...filterValues, [e.target.name]: e.target.value });
    setCurrentPage(1)
  };



  useEffect(() => {
    fetchData();
  }, [activeFilter, filterValuesFromModals, visibility]);

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
    const filterKeys: (keyof IFilterValues)[] = ['category', 'title', 'created_on', 'profile_selector', 'profile_description', 'status', 'subscriptions'];

    filterKeys.forEach(key => {
      if (filterValues[key]) {
        query += `&${encodeURIComponent(key)}=${encodeURIComponent(filterValues[key])}`;
      }
    });
    // modali
    for (let [key, value] of Object.entries(filterValuesFromModals)) {
      if (value) {

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
    return query;
  };

  const fetchData = async () => {
    try {
      let filterQuery = '';
      let filter2Query = generateFilterQuery();
      if (activeFilter) {
        filterQuery = `&${encodeURIComponent(activeFilter.parentCode)}=${encodeURIComponent(activeFilter.parentValue)}&${encodeURIComponent(activeFilter.code)}=${encodeURIComponent(activeFilter.value)}`;
      }

      const response = await axios.get<{ listContent: ITableData[], totalPages: number, pageSize: number }>(`${API_URL_DATA}${currentPage - 1}?${filterQuery}${filter2Query}&ft_status=${visibility}`);
      setData(response.data.listContent);
      setTotalPages(response.data.totalPages);
      setPageSize(response.data.pageSize)
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
      [modalName]: "" // Imposta il valore del filtro specifico a una stringa vuota
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
          <h2> <i className="fas fa-external-link-alt nav-icon" style={{ paddingRight: "8px" }}> </i> <b>My Offered Services</b></h2>
          <h5>Navigate to your Offered Services</h5>
        </div>

        <div className='col'>
          <Button onClick={() => New()} className="btn btn-success">
            New   <i className="fa fa-plus"></i>
          </Button>
        </div>

      </div>


      <Row style={{ paddingTop: "30px", flexWrap:"nowrap", display:"flex"}}>
        <Col md={2} style={{ display: 'flex', flexDirection: 'column' }}>



          <div className="input-basic mb-3" style={{ transform: "scale(0.8)", backgroundColor: "", position: "relative" }}>
            <Dropdown drop='up'>
              <Dropdown.Toggle id="dropdown-basic" >
                Service status: {visibility} {(visibility === "") && "any"}
              </Dropdown.Toggle>

              <Dropdown.Menu>
                <Dropdown.Item >------</Dropdown.Item>
                <Dropdown.Item onClick={() => handleVisibility(1)}>Any</Dropdown.Item>
                <Dropdown.Item onClick={() => handleVisibility(2)}>Active</Dropdown.Item>
                <Dropdown.Item onClick={() => handleVisibility(3)}>Disabled</Dropdown.Item>

              </Dropdown.Menu>
            </Dropdown>
          </div>
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
                    <div className="input-group " style={{ transform: "scale(0.8)" }}>
                      <button onClick={() => handleOpenModal('BOModal')} className="btn btn-outline-secondary" type="button" id="button-addon1">
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
                  <th style={{ textAlign: "center", verticalAlign: "middle" }}>Category</th>
                  <th style={{ textAlign: "center", verticalAlign: "middle" }}>Title </th>
                  <th style={{ textAlign: "center", verticalAlign: "middle" }}> Created On</th>
                  <th style={{ textAlign: "center", verticalAlign: "middle" }}>Profile Format</th>
                  <th style={{ textAlign: "center", verticalAlign: "middle" }}>Profile Description</th>
                  <th style={{ textAlign: "center", verticalAlign: "middle" }}>Status</th>
                  <th style={{ textAlign: "center", verticalAlign: "middle" }}>Subscriptions</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td></td>
                  <td></td>
                  <td></td>

                  <td></td>
                  <td><Form.Control
                    type="text"
                    name="created_on"
                    placeholder="Filter"
                    value={filterValues.created_on}
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


                  <td></td>

                  <td></td>

                </tr>

                {data.map((item, index) => (
                  <tr key={index}>
                    <th scope="row">{(((currentPage - 1)) * pageSize) + index + 1}</th>
                    <td>
                      <div className='row d-flex flex-nowrap'>
                        <div className='col'>
                          <Button variant="outline-light" className="btn btn-primary" onClick={() => EditService(item.cf_id)}>
                            <i className="fas fa-pencil-alt"></i>
                          </Button></div>
                        <div className='col'>
                          <Button variant="outline-light" className="btn btn-primary" onClick={() => RequestedServices(item.cf_id)}>
                            <i className="fas fa-handshake"></i>

                          </Button></div>
                      </div>
                    </td>

                    <td>{Inner(item.category)}</td>
                    <td>{item.title}</td>
                    <td>{item.created_on}</td>
                    <td>{item.profile_selector}</td>
                    <td>{item.profile_description}</td>
                    <td>{Inner(item.status)}</td>
                    <td>{Inner(item.subscriptions)}</td>
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

export default MyOfferedServices;
