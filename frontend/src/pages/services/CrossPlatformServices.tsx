import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Button from 'react-bootstrap/Button';
import Table from 'react-bootstrap/Table';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, Row, Col, Form, Card } from 'react-bootstrap';
import { New, DetailService } from '@app/components/helpers/Buttons';
import Pagination from '@app/components/helpers/Pagination';

if (localStorage.getItem("token")) {
  axios.defaults.headers.common["Authorization"] = `Bearer ${localStorage.getItem("token")}`;
}

const API_URL_FILTERS = "/list/left-grouping/results?id=19068e51-d124-40c2-8773-0954d41719b7&ft_status=disable";
const API_URL_DATA = "/datalist/cross_platform_service/page/";



interface IFilterValues {
  service: string;
  category: string;
  business_object_code: string;
  service_description: string;
  business_object_name: string;
  profile_selector: string;
  cross_platform_service_id: string;
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
  service: string;
  business_object_name: string;
  cf_name_2: string;

  service_description: string;
  business_object_code: string;
  profile_selector: string;
  cross_platform_service_id: string;

}

const CrossPlatformServices: React.FC = () => {
  const [data, setData] = useState<ITableData[]>([]);
  const [filters, setFilters] = useState<IFilter[]>([]);
  const [activeFilter, setActiveFilter] = useState<{ parentCode: string, parentValue: string, code: string, value: string } | null>(null);
  const [expandedFilter, setExpandedFilter] = useState<string | null>(null);
  const [PartialApi, setPartialApi] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const itemsPerPage = 10;

  const [filterValues, setFilterValues] = useState<IFilterValues>({
    service: "",
    category: "",
    business_object_code: "",
    service_description: "",
    business_object_name: "",
    profile_selector: "",
    cross_platform_service_id: ""
  });

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
  }, [activeFilter]);

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
    const filterKeys: (keyof IFilterValues)[] = ['service', 'category', 'service_description', 'business_object_code', 'business_object_name', 'profile_selector'];

    filterKeys.forEach(key => {
      if (key in filterValues) {
        if (filterValues[key] !== undefined && filterValues[key] !== null && filterValues[key] !== ''
        ) {
          index++;
          if (index > 0) {
            query += `&${encodeURIComponent(key)}=${encodeURIComponent(filterValues[key])}`;

          } else {
            query += `${encodeURIComponent(key)}=${encodeURIComponent(filterValues[key])}`;
            query = query + 1;
          }
        }
      }
    });

    //query += '&language-id=2';

    return query;
  };

  useEffect(() => {
    fetchData();
  }, [currentPage]);

  const fetchData = async () => {
    try {
      let filterQuery = '';
      let filterQuery2 = '';
      let filter2Query = generateFilterQuery();
      if (activeFilter) {
        filterQuery = `&${encodeURIComponent(activeFilter.parentCode)}=${encodeURIComponent(activeFilter.parentValue)}&${encodeURIComponent(activeFilter.code)}=${encodeURIComponent(activeFilter.value)}`;
      }

      if (filter2Query) {
        filterQuery2 = filter2Query;
      }


      const response = await axios.get<{ listContent: ITableData[], totalPages: number }>(`${API_URL_DATA}${currentPage - 1}?${filterQuery}${filterQuery2}`);
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

  return (
    <Container fluid>
      <h2><i className="fas fa-server nav-icon" ></i><b> Cross platform services</b></h2>
      <h5>Navigate to Cross Platform Services</h5>
      <Row style={{ paddingTop: "30px", flexWrap:"nowrap", display:"flex"}}>

        <Col md={2}  style={{}}>
          <Card>
            <h5 style={{ paddingLeft: "10px", paddingTop: "10px" }}><b>Cross Platform Services' Categories</b></h5>
            <h6 style={{ paddingLeft: "10px" }}>Navigate & Filter Business Objects by Category & Service categorization tree </h6>
            {renderButtonGroup(filters)}
            {renderActiveFilter()}
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
                  <th style={{ textAlign: "center", verticalAlign: "middle" }}>Service </th>

                  <th style={{ textAlign: "center", verticalAlign: "middle" }}> Service Description</th>
                  <th style={{ textAlign: "center", verticalAlign: "middle" }}>BO code</th>
                  <th style={{ textAlign: "center", verticalAlign: "middle" }}>BO Name</th>
                  <th style={{ textAlign: "center", verticalAlign: "middle" }}>Profile Format</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td></td>
                  <td></td>
                  <td><Form.Control
                    type="text"
                    name="category"
                    placeholder="Filter"
                    value={filterValues.category}
                    onChange={handleInputChange}
                  /></td>

                  <td><Form.Control
                    type="text"
                    name="service"
                    placeholder="Filter"
                    value={filterValues.service}
                    onChange={handleInputChange}
                  /></td>
                  <td><Form.Control
                    type="text"
                    name="service_description"
                    placeholder="Filter"
                    value={filterValues.service_description}
                    onChange={handleInputChange}
                  /></td>
                  <td><Form.Control
                    type="text"
                    name="business_object_code"
                    placeholder="Filter"
                    value={filterValues.business_object_code}
                    onChange={handleInputChange}
                  /></td>

                  <td><Form.Control
                    type="text"
                    name="business_object_name"
                    placeholder="Filter"
                    value={filterValues.business_object_name}
                    onChange={handleInputChange}
                  /></td>
                  <td><Form.Control
                    type="text"
                    name="profile_selector"
                    placeholder="Filter"
                    value={filterValues.profile_selector}
                    onChange={handleInputChange}
                  /></td>
                </tr>
                {data.map((item, index) => (
                  <tr key={index}>
                    <th scope="row">{(((currentPage - 1)) * 10) + index + 1}</th>
                    <td>
                      <Button variant="outline-light" className="btn btn-primary" onClick={() => DetailService(item.cross_platform_service_id)}>
                        <i className="fa fa-search"></i>
                      </Button>
                    </td>
                    <td>{item.category}</td>
                    <td>{item.service}</td>
                    <td>{item.service_description}</td>
                    <td>{item.business_object_code}</td>
                    <td>{item.business_object_name}</td>
                    <td>{item.profile_selector}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Pagination totalPages={totalPages} paginate={paginate} currentPage={currentPage} />
            </div>
            <Button type="submit" style={{ display: 'none' }}>Invia</Button>

          </Form>
        </Col>
      </Row>
    </Container>
  );
};

export default CrossPlatformServices;
