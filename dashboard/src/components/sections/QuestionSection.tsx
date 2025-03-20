import { Radio, Space, Typography } from "antd";
import { CheckCircleOutlined } from "@ant-design/icons";
import { QuestionContent } from "../../types/models";

const { Title, Text } = Typography;

const QuestionSection: React.FC<{
  content: QuestionContent;
  onAnswer: (optionId: number) => void;
}> = ({ content, onAnswer }) => {
  const handleAnswer = (optionId: number) => {
    onAnswer(optionId);
  };

  return (
    <div className="question-content">
      <Title level={4}>{content.question}</Title>
      <Radio.Group
        onChange={(e) => handleAnswer(e.target.value)}
        value={content.userQuestionAnswer?.optionId}
      >
        <Space direction="vertical">
          {content.options.map((option) => (
            <Radio key={option.id} value={option.id}>
              {option.content}
              {content.userQuestionAnswer && (
                <>
                  {option.id === content.userQuestionAnswer.optionId &&
                    option.isCorrect && (
                      <CheckCircleOutlined
                        style={{ color: "#52c41a", marginLeft: 8 }}
                      />
                    )}
                  {option.id === content.userQuestionAnswer.optionId &&
                    !option.isCorrect && (
                      <Text type="danger" style={{ marginLeft: 8 }}>
                        Incorrect
                      </Text>
                    )}
                </>
              )}
            </Radio>
          ))}
        </Space>
      </Radio.Group>
    </div>
  );
};

export default QuestionSection;
