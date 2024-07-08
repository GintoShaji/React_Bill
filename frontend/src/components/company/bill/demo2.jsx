import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import Select from 'react-select';
import config from "../../../functions/config";

const Demo = () => {
  const ID = Cookies.get('Login_id');
  const [customers, setCustomers] = useState([]);
  const [email, setEmail] = useState('');
  const [gstType, setGstType] = useState('');
  const [gstIn, setGstIn] = useState('');
  const [billingAddress, setBillingAddress] = useState('');
  const [placeOfSupply, setPlaceOfSupply] = useState('');
  

  useEffect(() => {
    fetchSalesOrderData();
  }, []);

  const fetchSalesOrderData = () => {
    axios
      .get(`${config.base_url}/fetch_purchasebill_data/${ID}/`)
      .then((res) => {
        console.log('SO Data==', res);
        if (res.data.status) {
          let cust = res.data.customers;
          const newCustOptions = cust.map((item) => ({
            label: item.first_name + ' ' + item.last_name,
            value: item.id,
          }));
          setCustomers(newCustOptions);
          
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  

  const customStyles = {
    control: (provided) => ({
      ...provided,
      minHeight: '38px',
      height: '38px',
    }),
    valueContainer: (provided) => ({
      ...provided,
      height: '38px',
      padding: '0 6px',
    }),
    input: (provided) => ({
      ...provided,
      margin: '0px',
    }),
    indicatorsContainer: (provided) => ({
      ...provided,
      height: '38px',
    }),
  };

  return (
    <div>
      <div className="col-md-4 mt-3">
        <label>Select Customer</label>
        <span className="text-danger ml-3" id="custErr"></span>
        <input type="hidden" name="customerId" id="customerId" value="" />
        <div className="d-flex align-items-center">
          <Select
            options={customers}
            styles={customStyles}
            name="customer"
            className="w-100"
            id="customer"
            required
            onChange={(selectedOption) =>
              (selectedOption ? selectedOption.value : '')
            }
            isClearable
            isSearchable
          />
          <button
            type="button"
            data-toggle="modal"
            data-target="#newCustomer"
            className="btn btn-outline-secondary ml-1"
            style={{ width: 'fit-content', height: 'fit-content' }}
          >
            +
          </button>
        </div>
      </div>

      {email && (
        <div className="mt-3">
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled
            />
          </div>

          <div className="form-group">
            <label>GST Type</label>
            <input
              type="text"
              className="form-control"
              value={gstType}
              onChange={(e) => setGstType(e.target.value)}
              disabled
            />
          </div>

          <div className="form-group">
            <label>GSTIN</label>
            <input
              type="text"
              className="form-control"
              value={gstIn}
              onChange={(e) => setGstIn(e.target.value)}
              disabled
            />
          </div>

          <div className="form-group">
            <label>Billing Address</label>
            <textarea
              className="form-control"
              value={billingAddress}
              onChange={(e) => setBillingAddress(e.target.value)}
              disabled
            ></textarea>
          </div>

          <div className="form-group">
            <label>Place of Supply</label>
            <input
              type="text"
              className="form-control"
              value={placeOfSupply}
              onChange={(e) => setPlaceOfSupply(e.target.value)}
              disabled
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Demo;
