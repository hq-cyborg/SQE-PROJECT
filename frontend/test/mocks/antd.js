// frontend/test/mocks/antd.js
import React from "react";

export const Table = ({ dataSource = [], columns = [] }) => (
  <table data-testid="mock-antd-table">
    <thead>
      <tr>
        {columns.map((col) => (
          <th key={col.title}>{col.title}</th>
        ))}
      </tr>
    </thead>
    <tbody>
      {dataSource.map((row, i) => (
        <tr key={i}>
          {columns.map((col) => {
            const value = col.dataIndex
              ? col.dataIndex instanceof Array
                ? col.dataIndex.reduce((acc, key) => acc[key], row)
                : row[col.dataIndex]
              : undefined;
            return <td key={col.title}>{col.render ? col.render(value, row) : value}</td>;
          })}
        </tr>
      ))}
    </tbody>
  </table>
);
