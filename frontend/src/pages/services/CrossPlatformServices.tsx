import React, { useState, useEffect } from 'react';
import axios, { AxiosError } from 'axios';
import Button from 'react-bootstrap/Button';
import Table from 'react-bootstrap/Table';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, Row, Col, Form, Card } from 'react-bootstrap';
import { DetailService } from '@app/components/helpers/Buttons';
import Pagination from '@app/components/helpers/Pagination';
import checkLevel from '@app/components/helpers/CheckLevel';
import axiosWithInterceptorInstance from '@app/components/helpers/AxiosConfig';

const API_URL_FILTERS = "/datalist/left-grouping/cross_platform_service";
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
  code: string;
  value: string;
  parrent: IFilter;
  children: IFilter[];
}

interface ITableData {
  category: string;
  service: string;
  business_object_name: string;
  category_name: string;
  service_description: string;
  business_object_code: string;
  profile_selector: string;
  cross_platform_service_id: string;

}

const CrossPlatformServices: React.FC = () => {
  const [data, setData] = useState<ITableData[]>([]);
  const [filters, setFilters] = useState<IFilter[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  type ExpandedFiltersByLevel = { [level: number]: string | null };
  const [expandedFiltersByLevel, setExpandedFiltersByLevel] = useState<ExpandedFiltersByLevel>({});

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
  }, [expandedFiltersByLevel, currentPage]);

  useEffect(() => {
    fetchFilters();
  }, []);



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
    return query;
  };

  const fetchData = async () => {
    try {
      let filterQuery = '';
      let filterQuery2 = '';
      let filter2Query = generateFilterQuery();
      if (expandedFiltersByLevel[0]) {

        filterQuery = `&${encodeURIComponent("category_group")}=${encodeURIComponent(expandedFiltersByLevel[0])}`;
      }

      if (expandedFiltersByLevel[1]) {

        filterQuery = filterQuery + `&${encodeURIComponent("service_group")}=${encodeURIComponent(expandedFiltersByLevel[1])}`;
      }

      if (filter2Query) {
        filterQuery2 = filter2Query;
      }


      const response = await axiosWithInterceptorInstance.get<{ listContent: ITableData[], totalPages: number }>(`${API_URL_DATA}${currentPage - 1}?${filterQuery}${filterQuery2}`);
      setData(response.data.listContent);
      setTotalPages(response.data.totalPages);

    } catch (error: unknown) {
      
      console.error('Error fetching data:', error);
  }
  };

  const paginate = (pageNumber: number): void => setCurrentPage(pageNumber);



  const fetchFilters = async () => {
    try {
      const response = await axiosWithInterceptorInstance.get<IFilter[]>(API_URL_FILTERS);
      setFilters(response.data.filter(element => element.value !== null));
    } catch (error) {
      console.error('Error fetching filters:', error);
    }
  };



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
  return (
    <Container fluid>
      <h2><i className="fas fa-server nav-icon" ></i><b> Cross platform services</b></h2>
      <h5>Navigate to Cross Platform Services</h5>
      <Row style={{ paddingTop: "30px", flexWrap: "nowrap", display: "flex" }}>
        <Col md={2} >
          <Card>
            <h5 style={{ paddingLeft: "10px", paddingTop: "10px" }}><b>Cross Platform Services' Categories</b></h5>
            <h6 style={{ paddingLeft: "10px" }}>Navigate & Filter Business Objects by Category & Service categorization tree </h6>
            {renderButtonGroup(filters)}
            <div style={{ padding: "15px" }}>
              {renderActiveFilter()}
            </div>
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
                      <Button variant="outline-light" className="btn btn-primary" onClick={() => DetailService(item.cross_platform_service_id)} data-bs-toggle="tooltip" data-placement="top" title="View cross-platform service details">
                        <i className="fa fa-search"></i>
                      </Button>
                    </td>
                    <td>{item.category + " - " + item.category_name}</td>
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
