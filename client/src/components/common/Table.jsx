const Table = ({ data = [], columns = [] }) => {
  const visibleColumns = columns.filter((col) => !col.hide);

  return (
    <table className="w-full text-sm">
      <thead className="bg-slate-50 border-b">
        <tr>
          {visibleColumns.map((col) => (
            <th key={col.key} className="p-4 text-left">
              {col.label}
            </th>
          ))}
        </tr>
      </thead>

      <tbody>
        {data.map((row) => (
          <tr key={row._id} className="border-b hover:bg-slate-50">
            {visibleColumns.map((col) => (
              <td key={col.key} className="p-4">
                {col.render ? col.render(row) : row[col.key] || "—"}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default Table;