import React, { useState, useEffect } from 'react';
import { Modal, Container, Row, Button, Card, Form } from 'react-bootstrap';
import Inner from '@app/components/helpers/InnerHtml';
import axiosWithInterceptorInstance from '@app/components/helpers/AxiosConfig';
import { ChangingOrder } from '@app/components/helpers/OrderingStateChange';
import checkLevel from '@app/components/helpers/CheckLevel';
const API_URL_FILTERS = "datalist/left-grouping/my_offered_services";

interface CategorizeProps {
    show: boolean;
    handleClose: () => void;
    onModalDataChange: (modalName: string, value: string) => void;
}
interface ITableData {
    sqlf_10: string;
    cf_code_2: string;
    sqlf_9: string;
    cf_name_2: string;
    cf_id: string,
    cf_input_profile: string;
    cf_title: string;
    cf_profile_selector: string;
    cf_input_data_source: string;
    sqlf_9_1: string
}
interface IFilter {
    id: string | null;
    code: string;
    value: string;
    count: number;
    parrent: IFilter;
    children: IFilter[];
}
interface IFilterValues {
    cf_title: string;
    category: string;
    sqlf_9: string;
    sqlf_9_1: string;
    cf_input_profile: string;
    profile_selector: string;
    cross_platform_service_id: string;
    sqlf_10: string;
}
const Offering: React.FC<CategorizeProps> = ({ show, handleClose, onModalDataChange }) => {
    const [data, setData] = useState<ITableData[]>([]);
    const [filters, setFilters] = useState<IFilter[]>([]);
    type ExpandedFiltersByLevel = { [level: number]: string | null };
    const [expandedFiltersByLevel, setExpandedFiltersByLevel] = useState<ExpandedFiltersByLevel>({});

    const [columnToFilter, setcolumnToFilter] = useState({ name: 'cf_created_on', value: 'asc' });
    const [createdOnOrdering, setCreatedOnOrdering] = useState("");
    const [titleOrdering, setTitleOrdering] = useState("");

    const [filterValues, setFilterValues] = useState<IFilterValues>({
        cf_title: "",
        category: "",
        sqlf_9: "",
        sqlf_9_1: "",
        cf_input_profile: "",
        profile_selector: "",
        cross_platform_service_id: "",
        sqlf_10: ""
    });
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        fetchData();
    };
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFilterValues({ ...filterValues, [e.target.name]: e.target.value });
    };
    const generateFilterQuery = () => {
        let query = '';
        let index = 0;
        const filterKeys: (keyof IFilterValues)[] = ['cf_title', 'category', 'sqlf_9_1', 'sqlf_9', 'cf_input_profile', 'profile_selector', 'sqlf_10'];

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

    function ChangingOrder_inside(stateToChange: any, columnToFilter: string) {
        switch (columnToFilter) {
            case "createdOn": {
                setCreatedOnOrdering(ChangingOrder(createdOnOrdering))
                setTitleOrdering("")
                setcolumnToFilter(prevState => ({
                    ...prevState,
                    name: "cf_created_on",
                    value: createdOnOrdering
                }));

                break;
            }
            case "title": {
                setTitleOrdering(ChangingOrder(titleOrdering))
                setCreatedOnOrdering("")
                setcolumnToFilter(prevState => ({
                    ...prevState,
                    name: "cf_title",
                    value: titleOrdering
                }));

                break;
            }
        }
    }
    const fetchData = async () => {
        let filterQuery = '';
        let filter2Query = generateFilterQuery();
        if (expandedFiltersByLevel[0]) {
            filterQuery = `&${encodeURIComponent("sqlgf_1")}=${encodeURIComponent(expandedFiltersByLevel[0])}`;
        }
        if (expandedFiltersByLevel[1]) {
            filterQuery = filterQuery + `&${encodeURIComponent("sqlgf_2")}=${encodeURIComponent(expandedFiltersByLevel[1])}`;
        }
        if (expandedFiltersByLevel[2]) {
            filterQuery = filterQuery + `&${encodeURIComponent("sqlgf_3")}=${encodeURIComponent(expandedFiltersByLevel[2])}`;
        }
        if (expandedFiltersByLevel[3]) {
            filterQuery = filterQuery + `&${encodeURIComponent("sqlgf_4")}=${encodeURIComponent(expandedFiltersByLevel[3])}`;
        }
        try {
            const response = await axiosWithInterceptorInstance.get(`/list/results/page/0?id=3878c122-7fb7-40fb-97b0-bfb66c8b35ca&ft_id_2=9a7db9a7-9942-499a-a5ac-0a41a99b7b87&ft_status=active&dates_check=active&country_check=active&cluster_check=active&market_check=active&role_check=active&language-id=2&sel-sort-code=${columnToFilter.name}&sel-sort-order=${columnToFilter.value}&${filterQuery}${filter2Query}`);
            setData(response.data.listContent);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };
    useEffect(() => {

        fetchData();
    }, [ columnToFilter]);


    const handleFilter = (filter: string) => {
        onModalDataChange('offeringModal_id', filter);
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
                    <h5 className="modal-title"> Available Services</h5>
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
                                <Form onSubmit={handleSubmit}>
                                    <table className="table table-hover table-striped table-bordered table-sm">
                                        <thead>
                                            <tr>
                                                <th>#</th>
                                                <th></th>
                                                <th style={{ textAlign: "center", verticalAlign: "middle" }}  >Category</th>
                                                <th style={{ textAlign: "center", verticalAlign: "middle" }}>Title <button className="btn btn-light text-end" onClick={() => ChangingOrder_inside(titleOrdering, "title")} style={{ paddingLeft: "10 px", scale: "0.6" }} >
                                                    {titleOrdering === "desc" && <i className="fas fa-sort-up"></i>}{titleOrdering === "asc" && <i className="fas fa-sort-down"></i>}{!titleOrdering && <i className="fas fa-sort"></i>}
                                                </button> </th>
                                                <th style={{ textAlign: "center", verticalAlign: "middle" }}>User Offering</th>
                                                <th style={{ textAlign: "center", verticalAlign: "middle" }}> Created On <button className="btn btn-light text-end" onClick={() => ChangingOrder_inside(createdOnOrdering, "createdOn")} style={{ paddingLeft: "10 px", scale: "0.6" }} >
                                                    {createdOnOrdering === "desc" && <i className="fas fa-sort-up"></i>}{createdOnOrdering === "asc" && <i className="fas fa-sort-down"></i>}{!createdOnOrdering && <i className="fas fa-sort"></i>}
                                                </button></th>
                                                <th style={{ textAlign: "center", verticalAlign: "middle" }}>Input Profile </th>
                                                <th style={{ textAlign: "center", verticalAlign: "middle" }}>Input Data Source </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td></td>
                                                <td></td>
                                                <td><Form.Control
                                                    type="text"
                                                    name="sqlf_10"
                                                    placeholder="Filter"
                                                    value={filterValues.sqlf_10}
                                                    onChange={handleInputChange}
                                                /></td>

                                                <td><Form.Control
                                                    type="text"
                                                    name="cf_title"
                                                    placeholder="Filter"
                                                    value={filterValues.cf_title}
                                                    onChange={handleInputChange}
                                                /></td>
                                                <td><Form.Control
                                                    type="text"
                                                    name="sqlf_9_1"
                                                    placeholder="Filter"
                                                    value={filterValues.sqlf_9_1}
                                                    onChange={handleInputChange}
                                                /></td>
                                                <td><Form.Control
                                                    type="text"
                                                    name="sqlf_9"
                                                    placeholder="Filter"
                                                    value={filterValues.sqlf_9}
                                                    onChange={handleInputChange}
                                                /></td>

                                                <td><Form.Control
                                                    type="text"
                                                    name="cf_input_profile"
                                                    placeholder="Filter"
                                                    value={filterValues.cf_input_profile}
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
                                                    <th scope="row">{index + 1}</th>
                                                    <td> <button className="btn btn-primary text-end" onClick={() => handleFilter(item.cf_id)}>
                                                        +
                                                    </button></td>
                                                    <td>{Inner(item.sqlf_10)}</td>


                                                    <td>{item.cf_title}</td>

                                                    <td>{Inner(item.sqlf_9_1)}</td>
                                                    <td>{item.sqlf_9}</td>
                                                    <td>{item.cf_input_profile}</td>
                                                    <td>{item.cf_input_data_source}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </Form>
                            </div>
                        </div>
                    </Container>
                </Modal.Body>
            </Modal></>
    );
}

export default Offering;
