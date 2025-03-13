import React, { useState, useEffect } from 'react';
import { Modal, Container, Row } from 'react-bootstrap';
import Pagination from '@app/components/helpers/Pagination';
import axiosWithInterceptorInstance from '@app/components/helpers/AxiosConfig';
import { ChangingOrder } from '@app/components/helpers/OrderingStateChange';
interface CategorizeProps {
    show: boolean;
    handleClose: () => void;
    onModalDataChange: (modalName: string, value: modalFilter) => void;
}
interface ITableData {
    category_id: string;
    code: string;
    name: string;
}
interface IFilter {
    id: string | null;
    code: string;
    value: string;
    count: number;
    parent: IFilter | null;
    children: IFilter[];
}
type modalFilter = {
    name: string;
    id: string;
}
const Categories: React.FC<CategorizeProps> = ({ show, handleClose, onModalDataChange }) => {
    const [data, setData] = useState<ITableData[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [pageSize, setPageSize] = useState(0);
    type ExpandedFiltersByLevel = { [level: number]: string | null };
    const [expandedFiltersByLevel, setExpandedFiltersByLevel] = useState<ExpandedFiltersByLevel>({});
    const [columnToFilter, setcolumnToFilter] = useState({ name: '', value: '' });
   
    const [codeOrdering, setCodeOrdering] = useState("");
    const [NameOrdering, setNameOrdering] = useState("");
    function ChangingOrder_inside(stateToChange: any, columnToFilter: string) {
        switch (columnToFilter) {
            case "code": {
                setCodeOrdering(ChangingOrder(codeOrdering))
                setNameOrdering("")
               
                setcolumnToFilter(prevState => ({
                    ...prevState,
                    name: "code",
                    value: codeOrdering
                }));

                break;
            }
            case "name": {
                setNameOrdering(ChangingOrder(NameOrdering))
               
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
        const fetchData = async () => {
            let filter = "";
            if (expandedFiltersByLevel[0]) {

                filter = `${encodeURIComponent("company_name_grouping")}=${encodeURIComponent(expandedFiltersByLevel[0])}`;
            }
            try {
                const response = await axiosWithInterceptorInstance.get(`/datalist/cross_platform_service_categories/page/${currentPage - 1}?${filter}&sel-sort-code=${columnToFilter.name}&sel-sort-order=${columnToFilter.value}`);
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
    const handleFilter = (filter: string, name: string) => {
        var modalObject = {
            name: name,
            id: filter,
        }
        onModalDataChange('category_id', modalObject);
        handleClose();
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
                    <Modal.Title id="contained-modal-title-vcenter">
                        Services
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Container fluid style={{ backgroundColor: '#f4f4f4' }}>
                        <Row>

                            <table className="table table-hover table-striped table-bordered table-sm">
                                <thead>
                                    <tr>

                                        <th>#</th>
                                        <th></th>
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
                                            <td> <button className="btn btn-primary text-end" onClick={() => handleFilter(item.category_id, item.name)}>
                                                +
                                            </button></td>
                                            <td>{item.code}</td>
                                            <td>{item.name}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </Row>
                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <Pagination totalPages={totalPages} paginate={paginate} currentPage={currentPage} />
                        </div>
                    </Container>
                </Modal.Body>
            </Modal></>
    );
}

export default Categories;
