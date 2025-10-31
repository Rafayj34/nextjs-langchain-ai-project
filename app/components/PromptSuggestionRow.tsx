import PromptSuggestionButton from "./PromptSuggestionButton";

const PromptSuggestionRow = ({onPromptClick}) => {
    const prompts = [
        "Who is head of the Mercedes F1 team?",
        "Who is the highest paid F1 driver?",
        "Which F1 team has the most championships?", 
    ]
  return (
    <>
    <div className="prompt-suggestion-row">
        {prompts.map((prompt, index) => (
            <PromptSuggestionButton
                key={`suggestion-${index}`}
                text={prompt}
                onClick={() => onPromptClick(prompt)}
            />
        ))}

    </div>
    </>
  );
};
    
export default PromptSuggestionRow;
