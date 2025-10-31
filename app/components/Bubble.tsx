import { convertToModelMessages } from "ai";
const Bubble = ({message}) => {
    const modelMessages = convertToModelMessages([message]);
    const role = modelMessages[0].role;
    const content = modelMessages[0].content[0];
    console.log('message:', message);
    console.log('Bubble message:', content);
  return (
    <div className={`${role} bubble`}>
        {content.text}
    </div>
  );
};
    
export default Bubble;
