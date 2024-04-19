import React, { useState, useEffect } from 'react';
import { Button, FormControl, Container, Row, Col } from 'react-bootstrap';

const Demo = () => {
    const [inputValue, setInputValue] = useState('');
    const [responses, setResponses] = useState([]);
    let eventSource = null;  // 声明 eventSource 作为组件的局部变量

    const handleInputChange = (event) => {
        setInputValue(event.target.value);
    };

    const handleSubmit = () => {
        const eventSource = new EventSource('http://localhost:5000/conversation', {
            method: 'POST',
            mode: 'cors', // 確保設定了 CORS 模式
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ query: inputValue })
        });

        eventSource.onmessage = function(event) {
            const newEvent = JSON.parse(event.data);
            setResponses(responses => [...responses, newEvent.data]); // 將每個新的事件數據添加到回答列表
        };

        eventSource.onerror = function() {
            console.error('EventSource failed');
            eventSource.close();
        };
    };

    useEffect(() => {
        console.log('組件已掛載，顯示輸入欄位和按鈕');
        return () => {
            eventSource && eventSource.close(); // 組件卸載時關閉 EventSource
        };
    }, []);

    return (
        <Container>
            <Row className="justify-content-md-center">
                <Col md={6}>
                    <FormControl
                        type="text"
                        placeholder="輸入您的問題"
                        value={inputValue}
                        onChange={handleInputChange}
                    />
                </Col>
                <Col md={2}>
                    <Button onClick={handleSubmit} variant="primary">提交</Button>
                </Col>
            </Row>
            {responses.length > 0 && (
                <Row className="justify-content-md-center mt-4">
                    <Col md={8}>
                        <div className="response-container">
                            <h5>回答:</h5>
                            {responses.map((res, idx) => <p key={idx}>{res}</p>)}
                        </div>
                    </Col>
                </Row>
            )}
        </Container>
    );
}

export default Demo;
