import axios from "axios";
import { useRef, useState } from "react";
import * as XLSX from "xlsx"; // Import XLSX to read Excel file
import ClipLoader from "react-spinners/ClipLoader";
import styled from "styled-components";
import excelrLogo from "/src/assets/logo.jpeg";
import {useNavigate} from "react-router-dom";

// Styled Components
const Container = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    font-family: Arial, sans-serif;
`;

const Header = styled.div`
    display: flex;
    align-items: center;
    justify-content: flex-start;
    width: 100%;
    font-size: 22px;
    font-weight: bold;
`;

const Logo = styled.img`
    height: 80px;
    margin-right: 0px;
`;

const Input = styled.input`
    padding: 10px;
    width: 280px;
    font-size: 16px;
    border: 2px solid ${props => props.error ? "red" : "#007bff"};
    border-radius: 5px;
    margin-bottom: 10px;
    outline: none;
`;

const Button = styled.button`
    padding: 10px 20px;
    font-size: 16px;
    color: white;
    background-color: #007bff;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    transition: background 0.3s;
    &:hover {
        background-color: #0056b3;
    }
    &:disabled {
        background-color: gray;
        cursor: not-allowed;
    }
`;

const ErrorText = styled.p`
    color: red;
    font-size: 14px;
    margin-top: -5px;
    margin-bottom: 10px;
`;

const SpinnerContainer = styled.div`
    margin: 20px;
    display: flex;
    justify-content: center;
    align-items: center;
`;

const Table = styled.table`
    width: 80%;
    max-width: 600px;
    border-collapse: collapse;
    margin-top: 20px;
    background: white;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    border-radius: 10px;
    overflow: hidden;
`;

const Th = styled.th`
    background-color: #007bff;
    color: white;
    padding: 12px;
    font-size: 16px;
    text-align: center;
`;

const Td = styled.td`
    padding: 12px;
    text-align: center;
    font-size: 16px;
    border-bottom: 1px solid #ddd;
`;

// Main Component
const LeetCodeEvaluator = () => {
    const [rep, setRep] = useState([]); // Default value: empty array
    const [loading, setLoading] = useState(false); // Default value: false
    const [error, setError] = useState(""); // Default value: empty string
    const [leetcodeId, setLeetcodeId] = useState([]); // Default value: empty array
    const [leetcodeId1, setLeetcodeId1] = useState([]); // Default value: empty array
    const [leetcodeId2, setLeetcodeId2] = useState([]); // Default value: empty array
    const [fileName, setFileName] = useState(""); // Default value: empty string
    const handleFileUpload = (event) => {
        setError("");
        setFileName(event.target.value);
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: "array" });
                const sheetName = workbook.SheetNames[0];
                const sheet = workbook.Sheets[sheetName];
                const json = XLSX.utils.sheet_to_json(sheet);
                let leetcode = [];
                let leetcode1 = [];
                let leetcode2 = [];
                for (let j = 0; j < json.length; j++) {
                    leetcode.push(json[j].leetcode_id);
                    leetcode1.push(json[j].userName);
                    leetcode2.push(json[j].email);
                }
                setLeetcodeId(leetcode);
                setLeetcodeId1(leetcode1);
                setLeetcodeId2(leetcode2);
            };
            reader.readAsArrayBuffer(file);
        }
    };

    const fetch_student_report = async () => {
        setLoading(true);
        setError(""); // Clear previous errors
        setFileName("");
        try {
            if (leetcodeId.length > 0) { // Check if leetcodeId is not empty
                const requests = leetcodeId.map(id => axios.get(`http://localhost:3000/${id}`));
                const responses = await Promise.all(requests);
                const data = responses.map(res => res.data);
                setRep(data);
            } else {
                setError("No LeetCode IDs found.");
            }
        } catch (error) {
            console.error("Error fetching data:", error);
            setError("Failed to fetch data. Please check your LeetCode IDs.");
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = () => {
        const tableData = rep.map((student, index) => ({
            LeetCodeID: leetcodeId[index],
            UserName: leetcodeId1[index],
            Email: leetcodeId2[index],
            TotalSolved: student.totalSolved,
            Easy: student.easySolved,
            Medium: student.mediumSolved,
            Hard: student.hardSolved,
            Ranking: student.ranking
        }));

        const worksheet = XLSX.utils.json_to_sheet(tableData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Report");

        XLSX.writeFile(workbook, "report.xlsx");
    };

    return (
        <>
            <Header>
                <Logo src={excelrLogo} alt="Logo" />
            </Header>

            <Container>
                <Input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} value={fileName}/>
                {error && <ErrorText>{error}</ErrorText>}
                
                <Button onClick={fetch_student_report} disabled={loading || !leetcodeId}>
                    {loading ? "Loading..." : "Generate Report"}
                </Button>

                {loading ? ( 
                    <SpinnerContainer>
                        <ClipLoader size={50} color={"#007bff"} loading={loading}/>
                    </SpinnerContainer>
                ) :  (
                        rep.length > 0 && (
                            <>
                                <Table>
                                    <thead>
                                        <tr>
                                            <Th>LeetCode ID</Th>
                                            <Th>userName</Th>
                                            <Th>email</Th>
                                            <Th>Total Solved</Th>
                                            <Th>Easy</Th>
                                            <Th>Medium</Th>
                                            <Th>Hard</Th>
                                            <Th>Ranking</Th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {rep.map((student, index) => (
                                            <tr key={index}>
                                                <Td>{leetcodeId[index]}</Td>
                                                <Td>{leetcodeId1[index]}</Td>
                                                <Td>{leetcodeId2[index]}</Td>
                                                <Td>{student.totalSolved}</Td>
                                                <Td>{student.easySolved}</Td>
                                                <Td>{student.mediumSolved}</Td>
                                                <Td>{student.hardSolved}</Td>
                                                <Td>{student.ranking}</Td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                                <button onClick={handleDownload}>Download Report</button>
                        </>
                        )
                    )
                }
            </Container>
        </>
    );
};

export default LeetCodeEvaluator;