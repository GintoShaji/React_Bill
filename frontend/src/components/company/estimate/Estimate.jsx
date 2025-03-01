import React, { useEffect, useState } from "react";
import FinBase from "../FinBase";
import * as XLSX from "xlsx";
import { Link, useNavigate } from "react-router-dom";
import Cookies from 'js-cookie';
import axios from "axios";
import config from "../../../functions/config";

function Estimate() {
  const navigate = useNavigate();
  function exportToExcel() {
    const Table = document.getElementById("estimateTableExport");
    const ws = XLSX.utils.table_to_sheet(Table);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    XLSX.writeFile(wb, "estimate.xlsx");
  }

  function sortTable(columnIndex) {
    var table, rows, switching, i, x, y, shouldSwitch;
    table = document.getElementById("estimateTable");
    switching = true;

    while (switching) {
      switching = false;
      rows = table.rows;

      for (i = 1; i < rows.length - 1; i++) {
        shouldSwitch = false;
        x = rows[i]
          .getElementsByTagName("td")
          [columnIndex].textContent.toLowerCase();
        y = rows[i + 1]
          .getElementsByTagName("td")
          [columnIndex].textContent.toLowerCase();

        if (x > y) {
          shouldSwitch = true;
          break;
        }
      }

      if (shouldSwitch) {
        rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
        switching = true;
      }
    }
  }

  function filterTable(row,filterValue) {
    var table1 = document.getElementById("estimateTable");
    var rows1 = table1.getElementsByTagName("tr");

    for (var i = 1; i < rows1.length; i++) {
      var statusCell = rows1[i].getElementsByTagName("td")[row];

      if (filterValue == "all" || statusCell.textContent.toLowerCase() == filterValue) {
        rows1[i].style.display = "";
      } else {
        rows1[i].style.display = "none";
      }
    }

    var table2 = document.getElementById("estimateTableExport");
    var rows2 = table2.getElementsByTagName("tr");

    for (var i = 1; i < rows2.length; i++) {
      var statusCell = rows2[i].getElementsByTagName("td")[row];

      if (filterValue == "all" || statusCell.textContent.toLowerCase() == filterValue) {
        rows2[i].style.display = "";
      } else {
        rows2[i].style.display = "none";
      }
    }
  }

  function sortHsnAscending() {
    var table = document.getElementById("estimateTable");
    var rows = Array.from(table.rows).slice(1);

    rows.sort(function (a, b) {
      var hsnA = parseInt(a.cells[2].textContent);
      var hsnB = parseInt(b.cells[2].textContent);
      return hsnA - hsnB;
    });

    // Remove existing rows from the table
    for (var i = table.rows.length - 1; i > 0; i--) {
      table.deleteRow(i);
    }

    // Append the sorted rows back to the table
    rows.forEach(function (row) {
      table.tBodies[0].appendChild(row);
    });
  }

  function searchTable(){
    var rows = document.querySelectorAll('#estimateTable tbody tr');
    var val = document.getElementById('search').value.trim().replace(/ +/g, ' ').toLowerCase();
    rows.forEach(function(row) {
      var text = row.textContent.replace(/\s+/g, ' ').toLowerCase();
      row.style.display = text.includes(val) ? '' : 'none';
    });
  }

  const ID = Cookies.get('Login_id');
  const [estimate, setestimate] = useState([]);

  const fetchestimate = () =>{
    axios.get(`${config.base_url}/fetch_estimate/${ID}/`).then((res)=>{
      console.log("ES RES=",res)
      if(res.data.status){
        var sls = res.data.estimate;
        setestimate([])
        sls.map((i)=>{
          setestimate((prevState)=>[
            ...prevState, i
          ])
        })
      }
    }).catch((err)=>{
      console.log('ERR',err)
    })
  }

  useEffect(()=>{
    fetchestimate();
  },[])
  
  function refreshAll(){
    setestimate([])
    fetchestimate();
  }
  return (
    <>
      <FinBase />
      <div
        className="page-content"
        style={{ backgroundColor: "#2f516f", minHeight: "100vh" }}
      >
        <div className="card radius-15 h-20">
          <div className="row">
            <div className="col-md-12">
              <center>
                <h2 className="mt-3">Estimate</h2>
              </center>
              <hr />
            </div>
          </div>
        </div>

        <div className="card radius-15">
          <div className="card-body">
            <div className="container-fluid">
              <div className="row">
                <div className="col-md-4">
                  <div className="d-flex align-items-center">
                    <input
                      type="text"
                      id="search"
                      className="form-control"
                      placeholder="Search.."
                      autoComplete="off"
                      onKeyUp={searchTable}
                    />
                    <div
                      className="dropdown ml-1"
                      style={{ justifyContent: "left" }}
                    >
                      <button
                        type="button"
                        style={{ width: "fit-content", height: "fit-content" }}
                        className="btn btn-outline-secondary dropdown-toggle text-grey"
                        data-toggle="dropdown"
                      >
                        <i className="fa fa-sort"></i> Sort by
                      </button>
                      <div
                        className="dropdown-menu"
                        style={{ backgroundColor: "black" }}
                      >
                        <a
                          className="dropdown-item"
                          onClick={refreshAll}
                          style={{
                            height: "40px",
                            fontSize: "15px",
                            color: "white",
                          }}
                        >
                          All
                        </a>
                        <a
                          className="dropdown-item"
                          style={{
                            height: "40px",
                            fontSize: "15px",
                            color: "white",
                            cursor: "pointer",
                          }}
                          onClick={()=>sortTable(2)}
                        >
                          Customer Name
                        </a>
                        <a
                          className="dropdown-item"
                          style={{
                            height: "40px",
                            fontSize: "15px",
                            color: "white",
                            cursor: "pointer",
                          }}
                          onClick={()=>sortTable(1)}
                        >
                          Estimate No.
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-md-2"></div>
                <div className="col-md-6 d-flex justify-content-end">
                  <button
                    type="button"
                    style={{ width: "fit-content", height: "fit-content" }}
                    className="btn btn-outline-secondary text-grey"
                    id="exportBtn"
                    onClick={exportToExcel}
                  >
                    <i className="fa fa-table"></i> Export To Excel
                  </button>
                  <div className="dropdown ml-1">
                    <button
                      type="button"
                      style={{ width: "fit-content", height: "fit-content" }}
                      className="btn btn-outline-secondary dropdown-toggle text-grey"
                      data-toggle="dropdown"
                    >
                      <i className="fa fa-filter"></i> filter by
                    </button>
                    <div
                      className="dropdown-menu"
                      style={{ backgroundColor: "black" }}
                    >
                      <a
                        className="dropdown-item"
                        style={{
                          height: "40px",
                          fontSize: "15px",
                          color: "white",
                          cursor: "pointer",
                        }}
                        onClick={()=>filterTable(5,'all')}
                      >
                        All
                      </a>
                      <a
                        className="dropdown-item"
                        style={{
                          height: "40px",
                          fontSize: "15px",
                          color: "white",
                          cursor: "pointer",
                        }}
                        onClick={()=>filterTable(5,'saved')}
                      >
                        Saved
                      </a>
                      <a
                        className="dropdown-item"
                        style={{
                          height: "40px",
                          fontSize: "15px",
                          color: "white",
                          cursor: "pointer",
                        }}
                        onClick={()=>filterTable(5,'draft')}
                      >
                        Draft
                      </a>
                    </div>
                  </div>
                  <Link to="/AddEstimate" className="ml-1">
                    <button
                      type="button"
                      style={{ width: "fit-content", height: "fit-content" }}
                      className="btn btn-outline-secondary text-grey"
                    >
                      <i className="fa fa-plus font-weight-light"></i> Estimate
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
          <div className="table-responsive">
            <table
              className="table table-responsive-md table-hover mt-4"
              id="estimateTable"
              style={{ textAlign: "center" }}
            >
              <thead>
                <tr>
                  <th>#</th>
                  <th>ESTIMATE NO.</th>
                  <th>CUSTOMER NAME</th>
                  <th>MAIL ID</th>
                  <th>AMOUNT</th>
                  <th>STATUS</th>
                  <th>BALANCE</th>
                  <th>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {estimate &&estimate.map((i,index)=>(
                  <tr
                    className="clickable-row"
                    onDoubleClick={()=>navigate(`/ViewEstimate/${i.id}/`)}
                    style={{ cursor: "pointer" }}
                  >
                    <td>{index+1}</td>
                    <td>{i.estimate_no}</td>
                    <td>{i.customer_name}</td>
                    <td>{i.customer_email}</td>
                    <td>{i.grandtotal}</td>
                    <td>{i.status}</td>
                    <td>{i.balance}</td>
                    <td>
                      <div className="btn-group">
                        <button type="button" className="btn btn-secondary dropdown-toggle" style={{width:'fit-content', height: 'fit-content'}} data-toggle="dropdown" aria-expanded="false">
                            Convert
                        </button>
                        <ul className="dropdown-menu">
                          <li><button type="button" className="dropdown-item fw-bold" onclick="window.location.href=`{% url 'Fin_convertestimateToSalesOrder' a.id %}`">To Sales Order</button></li>
                          <li><button type="button" className="dropdown-item fw-bold" onclick="window.location.href=`{% url 'Fin_convertestimateToInvoice' a.id %}`">To Invoice</button></li>
                          <li><button type="button" className="dropdown-item fw-bold" onclick="window.location.href=`{% url 'Fin_convertestimateToRecInvoice' a.id %}`">To Recurring Invoice</button></li>
                        </ul>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <table className="estimateTable" id="estimateTableExport" hidden>
      <thead>
        <tr>
          <th>#</th>
          <th>ESTIMATE NO NO.</th>
          <th>CUSTOMER NAME</th>
          <th>MAIL ID</th>
          <th>AMOUNT</th>
          <th>STATUS</th>
          <th>BALANCE</th>
        </tr>
      </thead>
      <tbody>
        {estimate && estimate.map((i,index)=>(
          <tr>
            <td>{index+1}</td>
            <td>{i.estimate_no}</td>
            <td>{i.customer_name}</td>
            <td>{i.customer_email}</td>
            <td>{i.grandtotal}</td>
            <td>{i.status}</td>
            <td>{i.balance}</td>
          </tr>
        ))}
      </tbody>
      </table>
    </>
  );
}

export default Estimate;
