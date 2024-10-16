import logging
from dotenv import load_dotenv
from typing import Optional, TypedDict
from pydantic import BaseModel

from langchain_core.messages import HumanMessage, SystemMessage
from langchain_openai import ChatOpenAI
from langgraph.graph import END, StateGraph, START

from app.configuration import Configuration
from app.prompts import (EDITOR_PROMPT, TWITTER_PROMPT, LINKEDIN_PROMPT, TWTTTER_CRITIQUE_PROMPT, LINKEDIN_CRITIQUE_PROMPT)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()

llm = ChatOpenAI(
    model="gpt-4o-mini",
    temperature=0,
)


# Define the State for the Agent
class Post(BaseModel):
    """A post written in a different versions"""
    
    drafts: list[str]
    feedback: Optional[str]
    
class OverallState(TypedDict):
    user_text: str
    target_audience: str
    edit_text: str
    tweet: Post
    linkedin_post: Post
    n_drafts: int
    workflow_status: str
    
# Define the nodes
def editor_node(state: OverallState):
    logger.info("Entering editor_node with state: %s", state)
    prompt = f"""
        text:
        ```
        {state["user_text"]}
        ```
    """.strip()
    
    response = llm.invoke([SystemMessage(EDITOR_PROMPT), HumanMessage(prompt)])
    logger.info("editor_node response: %s", response.content)
    
    return {"edit_text": response.content}

def tweet_writer_node(state: OverallState):
    logger.info("Entering tweet_writer_node with state: %s", state)
    post = state["tweet"]
    feedback_prompt = (
        ""
        if not post["feedback"]
        else f"""
        Tweet:
        ```
        {post["drafts"][-1]}
        ```
        """.strip()
    )
    
    prompt = f"""
        text:
        ```
        {state["edit_text"]}
        ```
        
        {feedback_prompt}
        
        Target audience: {state["target_audience"]}
        
        Write only the text for the post
    """.strip()
    
    response = llm.invoke([SystemMessage(TWITTER_PROMPT), HumanMessage(prompt)])
    logger.info("tweet_writer_node response: %s", response.content)
    post["drafts"].append(response.content)
    return {"tweet": post}
    
def linkedin_writer_node(state: OverallState):
    logger.info("Entering linkedin_writer_node with state: %s", state)
    post = state["linkedin_post"]
    feedback_prompt = (
        ""
        if not post["feedback"]
        else f"""
        LinkedIn post:
        ```
        {post["drafts"][-1]}
        ```
        
        Use the feedback to improve it:
        ```
        {post["feedback"]}
        ```
        """.strip()
    )
    
    prompt = f"""
        text:
        ```
        {state["edit_text"]}
        ```
        
        {feedback_prompt}
        
        Target audience: {state["target_audience"]}
        
        Write only the text for the post
    """.strip()
    
    response = llm.invoke([SystemMessage(LINKEDIN_PROMPT), HumanMessage(prompt)])
    logger.info("linkedin_writer_node response: %s", response.content)
    post["drafts"].append(response.content)
    return {"linkedin_post": post}

def critique_tweet_node(state: OverallState):
    logger.info("Entering critique_tweet_node with state: %s", state)
    post = state["tweet"]
    prompt = f"""
        Full post:
        ```
        {state["edit_text"]}
        ```
        
        Suggested tweet (critique this):
        ```
        {post["drafts"][-1]}
        ```
        
        Target audience: {state["target_audience"]}
    """.strip()
    
    response = llm.invoke([SystemMessage(TWTTTER_CRITIQUE_PROMPT), HumanMessage(prompt)])
    logger.info("critique_tweet_node response: %s", response.content)
    post["feedback"] = response.content
    return {"tweet": post}

def critique_linkedin_node(state: OverallState):
    logger.info("Entering critique_linkedin_node with state: %s", state)
    post = state["linkedin_post"]
    prompt = f"""
        Full post:
        ```
        {state["edit_text"]}
        ```
        
        Suggested LinkedIn post (critique this):
        ```
        {post["drafts"][-1]}
        ```
        
        Target audience: {state["target_audience"]}
    """.strip()

    response = llm.invoke([SystemMessage(LINKEDIN_CRITIQUE_PROMPT), HumanMessage(prompt)])
    logger.info("critique_linkedin_node response: %s", response.content)
    post["feedback"] = response.content
    return {"linkedin_post": post}

def supervisor_node(state: OverallState):
    logger.info("Entering supervisor_node with state: %s", state)
    if len(state["tweet"]["drafts"]) >= state["n_drafts"] and len(state["linkedin_post"]["drafts"]) >= state["n_drafts"]:
        state["workflow_status"] = "completed"
    else:
        state["workflow_status"] = "in_progress"
    return state

# Define the Edges
def should_rewrite(state: OverallState):
    tweet = state["tweet"]
    linked_post = state["linkedin_post"]
    n_drafts = state["n_drafts"]
    if len(tweet["drafts"]) >= n_drafts and len(linked_post["drafts"]) >= n_drafts:
        logger.info("should_rewrite decision: END")
        return END

    logger.info("should_rewrite decision: ['linkedin_critique', 'tweet_critique']")    
    return ["linkedin_critique", "tweet_critique"]

# Build a Graph
workflow = StateGraph(OverallState, config_schema=Configuration)

workflow.add_node("editor", editor_node)
workflow.add_node("tweet_writer", tweet_writer_node)
workflow.add_node("tweet_critique", critique_tweet_node)
workflow.add_node("linkedin_writer", linkedin_writer_node)
workflow.add_node("linkedin_critique", critique_linkedin_node)
workflow.add_node("supervisor", supervisor_node)

workflow.add_edge("editor", "tweet_writer")
workflow.add_edge("editor", "linkedin_writer")

workflow.add_edge("tweet_writer", "supervisor")
workflow.add_edge("linkedin_writer", "supervisor")
workflow.add_conditional_edges("supervisor", should_rewrite)

workflow.add_edge("tweet_critique", "tweet_writer")
workflow.add_edge("linkedin_critique", "linkedin_writer")

workflow.add_edge(START, "editor")

graph = workflow.compile()
