import React, { useState, useEffect } from 'react';
import { Modal, Container, Card } from 'react-bootstrap';
import Pagination from '@app/components/helpers/Pagination';
import Button from 'react-bootstrap/Button';
import checkLevel from '@app/components/helpers/CheckLevel';
import axiosWithInterceptorInstance from '@app/components/helpers/AxiosConfig';
import { ChangingOrder } from '@app/components/helpers/OrderingStateChange';
type modalFilter = {
  name: string;
  id: string;
}
interface CategorizeProps {
  show: boolean;
  handleClose: () => void;
  onModalDataChange: (modalName: string, value: modalFilter) => void;
}
const API_URL_FILTERS = "datalist/left-grouping/users";
interface ITableData {
  email: string;
  cf_code_2: string;
  name: string;
  cf_name_2: string;
  user_id: string,
  cf_short_description: string;
  username: string;
  cf_profile_selector: string;
}
interface IFilter {
  id: string | null;
  code: string;
  value: string;
  count: number;
  parrent: IFilter;
  children: IFilter[];
}
const UserRequesting: React.FC<CategorizeProps> = ({ show, handleClose, onModalDataChange }) => {
  type ExpandedFiltersByLevel = { [level: number]: string | null };
  const [expandedFiltersByLevel, setExpandedFiltersByLevel] = useState<ExpandedFiltersByLevel>({});
  const [data, setData] = useState<ITableData[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [pageSize, setPageSize] = useState(0);
  const [filters, setFilters] = useState<IFilter[]>([]);
  const [columnToFilter, setcolumnToFilter] = useState({ name: 'username', value: 'desc' });
  const [usernameOrdering, setUsernameOrdering] = useState("asc");
  const [companyOrdering, setCompanyOrdering] = useState("");
  useEffect(() => {
    fetchFilters();
  }, []);

  function ChangingOrder_inside(stateToChange: any, columnToFilter: string) {
    switch (columnToFilter) {
      case "username": {
        setUsernameOrdering(ChangingOrder(usernameOrdering))
        setCompanyOrdering("")
        setcolumnToFilter(prevState => ({
          ...prevState,
          name: "username",
          value: usernameOrdering
        }));

        break;
      }
      case "company": {
        setCompanyOrdering(ChangingOrder(companyOrdering))
        setUsernameOrdering("")
        setcolumnToFilter(prevState => ({
          ...prevState,
          name: "cf_name",
          value: companyOrdering
        }));

        break;
      }
    }
  }
  const fetchFilters = async () => {
    try {
      const response = await axiosWithInterceptorInstance.get<IFilter[]>(API_URL_FILTERS);
      setFilters(response.data.filter(element => element.value !== null));
    } catch (error) {
      console.error('Error fetching filters:', error);
    }
  };
  useEffect(() => {
    const fetchData = async () => {
      try {
        let filter = "";
        if (expandedFiltersByLevel[0]) {

          filter = `${encodeURIComponent("name")}=${encodeURIComponent(expandedFiltersByLevel[0])}`;
        }
        const response = await axiosWithInterceptorInstance.get(`/datalist/users/page/${currentPage - 1}?${filter}&sel-sort-code=${columnToFilter.name}&sel-sort-order=${columnToFilter.value}`);
        setData(response.data.listContent);
        setTotalPages(response.data.totalPages);
        setPageSize(response.data.pageSize)
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [currentPage, expandedFiltersByLevel,columnToFilter]);

  const paginate = (pageNumber: number): void => setCurrentPage(pageNumber);
  const handleFilter = (filter: string, name: string) => {
    var modalObject = {
      name: name,
      id: filter,
    }
    onModalDataChange('user_requesting_id', modalObject);
    handleClose();
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
        <div key={filterKey} >
          <Button
            variant="link"
            onClick={() => toggleExpand(filter.value, level, filter?.parrent?.value)}
            className="d-block text-start p-0 m-0"

          >
            <div style={{ /* fontSize: '0.7rem', */ textAlign: "left" }}>
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
    <><style type="text/css">
      {`
        .modal-90w {
          max-width: 90% !important;
        }
        `}
    </style>
      <Modal show={show} onHide={handleClose} dialogClassName="modal-90w">
        <Modal.Header closeButton>
          <h5 className="modal-title">Users</h5>
        </Modal.Header>
        <Modal.Body>
          <Container fluid style={{ backgroundColor: '#f4f4f4' }}>
            <div className='row '>
              <div className='col-md-2 mb-3'>
                <Card className="h-100 shadow-sm" >
                  <h5 className="card-title" style={{ paddingTop: "10px", paddingLeft: "10px", fontSize: '0.8rem' }}> <b>Company Categorization</b></h5>
                  <Card.Body style={{ overflowY: 'auto', overflowX: 'auto' }}>
                    {renderButtonGroup(filters)}
                    <div style={{ padding: "15px" }}>
                      {renderActiveFilter()}
                    </div>
                  </Card.Body>
                </Card>
              </div>
              <div className='col'>
                <table className="table table-hover table-striped table-bordered table-sm">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th></th>
                      <th style={{ textAlign: "center", verticalAlign: "middle" }}>Email</th>
                      <th style={{ textAlign: "center", verticalAlign: "middle" }}>Username <button className="btn btn-light text-end" onClick={() => ChangingOrder_inside(usernameOrdering, "username")} style={{ paddingLeft: "10 px", scale: "0.6" }} >
                        {usernameOrdering === "desc" && <i className="fas fa-sort-up"></i>}{usernameOrdering === "asc" && <i className="fas fa-sort-down"></i>}{!usernameOrdering && <i className="fas fa-sort"></i>}
                      </button></th>
                      <th style={{ textAlign: "center", verticalAlign: "middle" }}>Company <button className="btn btn-light text-end" onClick={() => ChangingOrder_inside(companyOrdering, "company")} style={{ paddingLeft: "10 px", scale: "0.6" }} >
                        {companyOrdering === "desc" && <i className="fas fa-sort-up"></i>}{companyOrdering === "asc" && <i className="fas fa-sort-down"></i>}{!companyOrdering && <i className="fas fa-sort"></i>}
                      </button></th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((item, index) => (
                      <tr key={index}>
                        <th scope="row">{(((currentPage - 1)) * pageSize) + index + 1}</th>
                        <td> <button className="btn btn-primary text-end" onClick={() => handleFilter(item.user_id, item.username)}>
                          +
                        </button></td>
                        <td>{item.email}</td>
                        <td>{item.username}</td>
                        <td>{item.name}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Pagination totalPages={totalPages} paginate={paginate} currentPage={currentPage} />
            </div>
          </Container>
        </Modal.Body>
      </Modal></>
  );
}

export default UserRequesting;
