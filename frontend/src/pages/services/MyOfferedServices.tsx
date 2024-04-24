import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Button from 'react-bootstrap/Button';
import Table from 'react-bootstrap/Table';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, Row, Col, Form, Dropdown, Card } from 'react-bootstrap';
import Categories from '../modals/Categories';
import Service from '../modals/Service';
import BusinnesObject from '../modals/BusinnesObject';
import { EditService, RequestsOnService } from '@app/components/helpers/Buttons';
import { New } from '@app/components/helpers/Buttons';
import Inner from '@app/components/helpers/InnerHtml';
import Pagination from '@app/components/helpers/Pagination';
import checkLevel from '@app/components/helpers/CheckLevel';
if (localStorage.getItem("token")) {
  axios.defaults.headers.common["Authorization"] = `Bearer ${localStorage.getItem("token")}`;
}
const API_URL_FILTERS = "datalist/left-grouping/my_offered_services";
const API_URL_DATA = "/datalist/my_offered_services/page/";

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

}
const MyOfferedServices: React.FC = () => {
  const [data, setData] = useState<ITableData[]>([]);
  const [filters, setFilters] = useState<IFilter[]>([]);
  type ExpandedFiltersByLevel = { [level: number]: string | null };
  const [expandedFiltersByLevel, setExpandedFiltersByLevel] = useState<ExpandedFiltersByLevel>({});
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
  });

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
  const [visibility, setVisibility] = useState("");


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
  }, [filterValuesFromModals, visibility, expandedFiltersByLevel, currentPage]);

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
    console.log(index)
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
      const response = await axios.get<{ listContent: ITableData[], totalPages: number, pageSize: number }>(`${API_URL_DATA}${currentPage - 1}?${filter2Query}${filterQuery}&ft_status=${visibility}`);
      setData(response.data.listContent);
      setTotalPages(response.data.totalPages);
      setPageSize(response.data.pageSize)
    } catch (error) {
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
          <h2> <i className="fas fa-external-link-alt nav-icon" style={{ paddingRight: "8px" }}> </i> <b>My Offered Services</b></h2>
          <h5>Navigate to your Offered Services</h5>
        </div>

        <div className='col'>
          <Button onClick={() => New()} className="btn btn-success" data-bs-toggle="tooltip" data-placement="top" title="Create a new offered service" >
            New   <i className="fa fa-plus"></i>
          </Button>
        </div>

      </div>


      <Row style={{ paddingTop: "30px", flexWrap: "nowrap", display: "flex" }}>
        <Col md={2} style={{ display: 'flex', flexDirection: 'column' }}>



          <div className="input-basic mb-3" style={{ transform: "scale(0.8)", backgroundColor: "", position: "relative" }}>
            <Dropdown drop='up' data-bs-toggle="tooltip" data-placement="top" title="Select the status of the services you want visualize">
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
                      <input className="form-control" placeholder={filterValuesFromModals.category_id.name} aria-label="Example text with button addon" aria-describedby="button-addon1" />
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
                      <input className="form-control" placeholder={filterValuesFromModals.service_id.name} aria-label="Example text with button addon" aria-describedby="button-addon1" />
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
                      <input className="form-control" placeholder={filterValuesFromModals.business_object_id.name} aria-label="Example text with button addon" aria-describedby="button-addon1" />
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
                          <Button variant="outline-light" className="btn btn-primary" onClick={() => EditService(item.cf_id)} data-bs-toggle="tooltip" data-placement="top" title="Edit your offered service">
                            <i className="fas fa-pencil-alt"></i>
                          </Button></div>
                        <div className='col'>
                          <Button variant="outline-light" className="btn btn-primary" onClick={() => RequestsOnService(item.cf_id)} data-bs-toggle="tooltip" data-placement="top" title="View your offered service's requests">
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
