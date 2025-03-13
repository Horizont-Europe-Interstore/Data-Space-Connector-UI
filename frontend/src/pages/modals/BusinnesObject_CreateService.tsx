import React, { useState, useEffect } from 'react';
import { Button, Card, Container } from 'react-bootstrap';
import Modal from 'react-bootstrap/Modal';
import checkLevel from '@app/components/helpers/CheckLevel';
import Pagination from '@app/components/helpers/Pagination';
import axiosWithInterceptorInstance from '@app/components/helpers/AxiosConfig';
import { ChangingOrder } from '@app/components/helpers/OrderingStateChange';
const API_URL_FILTERS = "datalist/left-grouping/cross_platform_service_business_objects";
interface CategorizeProps {
    show: boolean;
    handleClose: () => void;
    onModalDataChange: (modalName: string, value: string[]) => void;
}

interface ITableData {
    service_name: string;
    service_code: string;
    category_name: string;
    category_code: string;
    name: string;
    cf_name_2: string;
    business_object_id: string,
    cf_short_description: string;
    code: string;
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

const BusinnesObject: React.FC<CategorizeProps> = ({ show, handleClose, onModalDataChange }) => {
    const [data, setData] = useState<ITableData[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [pageSize, setPageSize] = useState(0);
    type ExpandedFiltersByLevel = { [level: number]: string | null };
    const [expandedFiltersByLevel, setExpandedFiltersByLevel] = useState<ExpandedFiltersByLevel>({});
    const [filters, setFilters] = useState<IFilter[]>([]);
    const [columnToFilter, setcolumnToFilter] = useState({ name: 'created_on', value: 'asc' });
    const [categoryOrdering, setCategoryOrdering] = useState("");
    const [serviceOrdering, setServiceOrdering] = useState("");
    const [codeOrdering, setCodeOrdering] = useState("");
    const [NameOrdering, setNameOrdering] = useState("");
    function ChangingOrder_inside(stateToChange: any, columnToFilter: string) {
        switch (columnToFilter) {
            case "category_name": {
                setCategoryOrdering(ChangingOrder(categoryOrdering))
                setNameOrdering("")
                setCodeOrdering("")
                setServiceOrdering("")
                setcolumnToFilter(prevState => ({
                    ...prevState,
                    name: "category_name",
                    value: categoryOrdering
                }));

                break;
            }
            case "service_name": {
                setServiceOrdering(ChangingOrder(serviceOrdering))
                setCategoryOrdering("")
                setNameOrdering("")
                setCodeOrdering("")
                setcolumnToFilter(prevState => ({
                    ...prevState,
                    name: "service_name",
                    value: serviceOrdering
                }));

                break;
            }
            case "code": {
                setCodeOrdering(ChangingOrder(codeOrdering))
                setNameOrdering("")
                setServiceOrdering("")
                setCategoryOrdering("")
                setcolumnToFilter(prevState => ({
                    ...prevState,
                    name: "code",
                    value: codeOrdering
                }));

                break;
            }
            case "name": {
                setNameOrdering(ChangingOrder(NameOrdering))
                setCategoryOrdering("")
                setServiceOrdering("")
                setCodeOrdering("")
                setcolumnToFilter(prevState => ({
                    ...prevState,
                    name: "name",
                    value: NameOrdering
                }));

                break;
            }
        }
    }

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
    useEffect(() => {
        const fetchData = async () => {
            try {
                let filter = "";
                if (expandedFiltersByLevel[0]) {
                    filter = `${encodeURIComponent("category_grouping")}=${encodeURIComponent(expandedFiltersByLevel[0])}`;
                }
                if (expandedFiltersByLevel[1]) {
                    filter = filter + `&${encodeURIComponent("service_grouping")}=${encodeURIComponent(expandedFiltersByLevel[1])}`;
                }
                if (expandedFiltersByLevel[2]) {
                    filter = filter + `&${encodeURIComponent("business_object_grouping")}=${encodeURIComponent(expandedFiltersByLevel[2])}`;
                }
                if (expandedFiltersByLevel[3]) {
                    filter = filter + `&${encodeURIComponent("users_grouping")}=${encodeURIComponent(expandedFiltersByLevel[3])}`;
                }
                const response = await axiosWithInterceptorInstance.get(`datalist/cross_platform_service_business_objects/page/${currentPage - 1}?${filter}&sel-sort-code=${columnToFilter.name}&sel-sort-order=${columnToFilter.value}`);
                setData(response.data.listContent);
                setTotalPages(response.data.totalPages);
                setPageSize(response.data.pageSize)
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
        fetchData();
    }, [currentPage, expandedFiltersByLevel, columnToFilter]);
    const paginate = (pageNumber: number): void => setCurrentPage(pageNumber);
    const handleFilter = (filter: ITableData) => {
        const firstItem = data[0];
        onModalDataChange('catalog_business_object_id', [filter.business_object_id, filter.name, filter.service_code, filter.service_name, filter.category_code, filter.category_name]);

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
                <div key={filterKey}>
                    <Button
                        variant="link"
                        onClick={() => toggleExpand(filter.value, level, filter?.parrent?.value)}
                    >

                        <div style={{ textAlign: "left" }}>
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
                    <h5 className="modal-title"> Business Objects</h5>
                </Modal.Header>
                <Modal.Body>
                    <Container fluid className="bg-light p-3" style={{ borderRadius: '15px' }}>
                        <div className='row '>


                            <div className='col-md-2 mb-3'>
                                <Card className="h-100 shadow-sm">
                                    <h5 className="card-title" style={{ paddingTop: "10px", paddingLeft: "10px", fontSize: '0.8rem' }}> <b>Business Object Categorization</b></h5>
                                    <Card.Body style={{ overflowY: 'auto', overflowX: 'auto' }}>
                                        {renderButtonGroup(filters)}
                                        <div style={{ padding: "15px" }}>
                                            {renderActiveFilter()}
                                        </div>
                                    </Card.Body>
                                </Card>
                            </div>
                            <div className='col'>
                                <h5 className="card-title">Business Objects</h5>
                                <div className="table-responsive">
                                    <table className="table table-hover table-striped table-bordered table-sm">
                                        <thead className="table-light">
                                            <tr>

                                                <th>#</th>
                                                <th></th>
                                                <th style={{ textAlign: "center", verticalAlign: "middle" }}>Category <button className="btn btn-light text-end" onClick={() => ChangingOrder_inside(categoryOrdering, "category_name")} style={{ paddingLeft: "10 px", scale: "0.6" }} >
                                                    {categoryOrdering === "desc" && <i className="fas fa-sort-up"></i>}{categoryOrdering === "asc" && <i className="fas fa-sort-down"></i>}{!categoryOrdering && <i className="fas fa-sort"></i>}
                                                </button></th>
                                                <th style={{ textAlign: "center", verticalAlign: "middle" }}>Service <button className="btn btn-light text-end" onClick={() => ChangingOrder_inside(serviceOrdering, "service_name")} style={{ paddingLeft: "10 px", scale: "0.6" }} >
                                                    {serviceOrdering === "desc" && <i className="fas fa-sort-up"></i>}{serviceOrdering === "asc" && <i className="fas fa-sort-down"></i>}{!serviceOrdering && <i className="fas fa-sort"></i>}
                                                </button></th>
                                                <th style={{ textAlign: "center", verticalAlign: "middle" }}>Code <button className="btn btn-light text-end" onClick={() => ChangingOrder_inside(codeOrdering, "code")} style={{ paddingLeft: "10 px", scale: "0.6" }} >
                                                    {codeOrdering === "desc" && <i className="fas fa-sort-up"></i>}{codeOrdering === "asc" && <i className="fas fa-sort-down"></i>}{!codeOrdering && <i className="fas fa-sort"></i>}
                                                </button></th>
                                                <th style={{ textAlign: "center", verticalAlign: "middle" }}>Name <button className="btn btn-light text-end" onClick={() => ChangingOrder_inside(NameOrdering, "name")} style={{ paddingLeft: "10 px", scale: "0.6" }} >
                                                    {NameOrdering === "desc" && <i className="fas fa-sort-up"></i>}{NameOrdering === "asc" && <i className="fas fa-sort-down"></i>}{!NameOrdering && <i className="fas fa-sort"></i>}
                                                </button></th>

                                            </tr>
                                        </thead>
                                        <tbody>
                                            {data.map((item, index) => (
                                                <tr key={index}>
                                                    <th scope="row">{(((currentPage - 1)) * pageSize) + index + 1}</th>
                                                    <td> <button className="btn btn-primary text-end" onClick={() => handleFilter(item)}>
                                                        +
                                                    </button></td>

                                                    <td>{item.category_code + "-" + item.category_name}</td>
                                                    <td>{item.service_name}</td>
                                                    <td>{item.code}</td>
                                                    <td>{item.name}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
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

export default BusinnesObject;
