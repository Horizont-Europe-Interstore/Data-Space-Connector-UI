import React, { useState, useEffect } from 'react';
import axios, { AxiosError } from 'axios';
import { Modal, Container, Row, Button, Card } from 'react-bootstrap';
import Inner from '@app/components/helpers/InnerHtml';
import checkLevel from '@app/components/helpers/CheckLevel';
import Pagination from '@app/components/helpers/Pagination';
import axiosWithInterceptorInstance from '@app/components/helpers/AxiosConfig';
import { ChangingOrder } from '@app/components/helpers/OrderingStateChange';
const API_URL_FILTERS = "datalist/left-grouping/my_offered_services";
interface CategorizeProps {
    show: boolean;
    handleClose: () => void;
    onModalDataChange: (modalName: string, value: string) => void;
}
type modalFilter = {
    name: string;
    id: string;
}
interface ITableData {
    category: string;
    cf_code_2: string;
    profile_description: string;
    cf_name_2: string;
    cf_id: string,
    profile_selector: string;
    title: string;
    cf_profile_selector: string;
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
const Service: React.FC<CategorizeProps> = ({ show, handleClose, onModalDataChange }) => {
    const [data, setData] = useState<ITableData[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [pageSize, setPageSize] = useState(0);
    type ExpandedFiltersByLevel = { [level: number]: string | null };
    const [expandedFiltersByLevel, setExpandedFiltersByLevel] = useState<ExpandedFiltersByLevel>({});
    const [filters, setFilters] = useState<IFilter[]>([]);

    const [columnToFilter, setcolumnToFilter] = useState({ name: '', value: '' });
    const [createdOnOrdering, setCreatedOnOrdering] = useState("");
    const [categoryOrdering, setCategoryOrdering] = useState("");
    const [titleOrdering, setTitleOrdering] = useState("");

    function ChangingOrder_inside(stateToChange: any, columnToFilter: string) {
        switch (columnToFilter) {
            case "createdOn": {
                setCreatedOnOrdering(ChangingOrder(createdOnOrdering))
                setTitleOrdering("")
                setCategoryOrdering("")
                setcolumnToFilter(prevState => ({
                    ...prevState,
                    name: "created_on",
                    value: createdOnOrdering
                }));

                break;
            }
            case "title": {
                setTitleOrdering(ChangingOrder(titleOrdering))
                setCreatedOnOrdering("")
                setCategoryOrdering("")
                setcolumnToFilter(prevState => ({
                    ...prevState,
                    name: "title",
                    value: titleOrdering
                }));

                break;
            }
            case "category": {
                setCategoryOrdering(ChangingOrder(categoryOrdering))
                setTitleOrdering("")
                setCreatedOnOrdering("")
                setcolumnToFilter(prevState => ({
                    ...prevState,
                    name: "category",
                    value: categoryOrdering
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
            let filter = "";
            if (expandedFiltersByLevel[0]) {

                filter = `${encodeURIComponent("category_group")}=${encodeURIComponent(expandedFiltersByLevel[0])}`;
            }
            if (expandedFiltersByLevel[1]) {

                filter = filter + `&${encodeURIComponent("service_group")}=${encodeURIComponent(expandedFiltersByLevel[1])}`;
            }
            if (expandedFiltersByLevel[2]) {

                filter = filter + `&${encodeURIComponent("business_object_group")}=${encodeURIComponent(expandedFiltersByLevel[2])}`;
            }
            if (expandedFiltersByLevel[3]) {

                filter = filter + `&${encodeURIComponent("users_group")}=${encodeURIComponent(expandedFiltersByLevel[3])}`;
            }
            try {
                const response = await axiosWithInterceptorInstance.get(`/datalist/my_offered_services/page/${currentPage - 1}?${filter}&sel-sort-code=${columnToFilter.name}&sel-sort-order=${columnToFilter.value}`);
                setData(response.data.listContent);
                setTotalPages(response.data.totalPages);
                setPageSize(response.data.pageSize)
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, [currentPage, expandedFiltersByLevel, expandedFiltersByLevel, columnToFilter]);
    const paginate = (pageNumber: number): void => setCurrentPage(pageNumber);
    const handleFilter = (filter: string) => {
        onModalDataChange('ft_id2', filter);
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
        <><style type="text/css">
            {`
        .modal-90w {
          max-width: 90% !important;
        }
        `}
        </style>
            <Modal show={show} onHide={handleClose} dialogClassName="modal-90w">
                <Modal.Header closeButton>
                    <h5 className="modal-title"> Data Offerings</h5>
                </Modal.Header>
                <Modal.Body>
                    <Container fluid style={{ backgroundColor: '#f4f4f4' }}>
                        <div className='row '>


                            <div className='col-md-2 mb-3'>
                                <Card className="h-100 shadow-sm" >
                                    <h5 className="card-title" style={{ paddingTop: "10px", paddingLeft: "10px", fontSize: '0.8rem' }}> <b>Cross Platform Categorization</b></h5>
                                    <Card.Body style={{ overflowY: 'auto', overflowX: 'auto' }}>
                                        {renderButtonGroup(filters)}
                                        <div style={{ padding: "15px" }}>
                                            {renderActiveFilter()}
                                        </div>
                                    </Card.Body>
                                </Card>
                            </div>
                            <div className='col'>
                                <div className="table-responsive">
                                    <table className="table table-hover table-striped table-bordered table-sm">
                                        <thead>
                                            <tr>

                                                <th>#</th>
                                                <th></th>
                                                <th style={{ textAlign: "center", verticalAlign: "middle" }}>Category <button className="btn btn-light text-end" onClick={() => ChangingOrder_inside(categoryOrdering, "category")} style={{ paddingLeft: "10 px", scale: "0.6" }} >
                                                    {categoryOrdering === "desc" && <i className="fas fa-sort-up"></i>}{categoryOrdering === "asc" && <i className="fas fa-sort-down"></i>}{!categoryOrdering && <i className="fas fa-sort"></i>}
                                                </button></th>
                                                <th style={{ textAlign: "center", verticalAlign: "middle" }}>Title <button className="btn btn-light text-end" onClick={() => ChangingOrder_inside(titleOrdering, "title")} style={{ paddingLeft: "10 px", scale: "0.6" }} >
                                                    {titleOrdering === "desc" && <i className="fas fa-sort-up"></i>}{titleOrdering === "asc" && <i className="fas fa-sort-down"></i>}{!titleOrdering && <i className="fas fa-sort"></i>}
                                                </button> </th>
                                                <th style={{ textAlign: "center", verticalAlign: "middle" }}> Created On <button className="btn btn-light text-end" onClick={() => ChangingOrder_inside(createdOnOrdering, "createdOn")} style={{ paddingLeft: "10 px", scale: "0.6" }} >
                                                    {createdOnOrdering === "desc" && <i className="fas fa-sort-up"></i>}{createdOnOrdering === "asc" && <i className="fas fa-sort-down"></i>}{!createdOnOrdering && <i className="fas fa-sort"></i>}
                                                </button></th>
                                                <th style={{ textAlign: "center", verticalAlign: "middle" }}>Input profile </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {data.map((item, index) => (
                                                <tr key={index}>
                                                    <th scope="row">{(((currentPage - 1)) * pageSize) + index + 1}</th>
                                                    <td> <button className="btn btn-primary text-end" onClick={() => handleFilter(item.cf_id)}>
                                                        +
                                                    </button></td>
                                                    <td>{Inner(item.category)}</td>
                                                    <td>{item.title}</td>
                                                    <td>{item.created_on}</td>
                                                    <td>{item.profile_description}</td>
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

export default Service;
