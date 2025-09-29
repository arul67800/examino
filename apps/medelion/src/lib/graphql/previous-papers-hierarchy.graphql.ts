import { gql } from '@apollo/client';

// Previous Papers Hierarchy Fragment for reuse
const PREVIOUS_PAPERS_HIERARCHY_FRAGMENT = gql`
  fragment PreviousPapersHierarchyItem on HierarchyItem {
    id
    name
    level
    type
    color
    order
    parentId
    questionCount
    isPublished
    createdAt
    updatedAt
  }
`;

// Recursive fragment for nested hierarchy
const PREVIOUS_PAPERS_HIERARCHY_TREE_FRAGMENT = gql`
  fragment PreviousPapersHierarchyTree on HierarchyItem {
    ...PreviousPapersHierarchyItem
    children {
      ...PreviousPapersHierarchyItem
      children {
        ...PreviousPapersHierarchyItem
        children {
          ...PreviousPapersHierarchyItem
          children {
            ...PreviousPapersHierarchyItem
          }
        }
      }
    }
  }
  ${PREVIOUS_PAPERS_HIERARCHY_FRAGMENT}
`;

export const GET_PREVIOUS_PAPERS_HIERARCHY = gql`
  query GetPreviousPapersHierarchy {
    previousPapersHierarchyItems {
      ...PreviousPapersHierarchyTree
    }
  }
  ${PREVIOUS_PAPERS_HIERARCHY_TREE_FRAGMENT}
`;

export const GET_PREVIOUS_PAPERS_HIERARCHY_ITEM = gql`
  query GetPreviousPapersHierarchyItem($id: ID!) {
    previousPapersHierarchyItem(id: $id) {
      ...PreviousPapersHierarchyTree
      parent {
        ...PreviousPapersHierarchyItem
      }
    }
  }
  ${PREVIOUS_PAPERS_HIERARCHY_TREE_FRAGMENT}
`;

export const CREATE_PREVIOUS_PAPERS_HIERARCHY_ITEM = gql`
  mutation CreatePreviousPapersHierarchyItem($input: CreateHierarchyItemInput!) {
    createPreviousPapersHierarchyItem(input: $input) {
      ...PreviousPapersHierarchyItem
    }
  }
  ${PREVIOUS_PAPERS_HIERARCHY_FRAGMENT}
`;

export const UPDATE_PREVIOUS_PAPERS_HIERARCHY_ITEM = gql`
  mutation UpdatePreviousPapersHierarchyItem($id: ID!, $input: UpdateHierarchyItemInput!) {
    updatePreviousPapersHierarchyItem(id: $id, input: $input) {
      ...PreviousPapersHierarchyItem
    }
  }
  ${PREVIOUS_PAPERS_HIERARCHY_FRAGMENT}
`;

export const DELETE_PREVIOUS_PAPERS_HIERARCHY_ITEM = gql`
  mutation DeletePreviousPapersHierarchyItem($id: ID!) {
    deletePreviousPapersHierarchyItem(id: $id)
  }
`;

export const UPDATE_PREVIOUS_PAPERS_HIERARCHY_ORDER = gql`
  mutation UpdatePreviousPapersHierarchyOrder($items: [ReorderHierarchyItemInput!]!) {
    reorderPreviousPapersHierarchyItems(items: $items) {
      ...PreviousPapersHierarchyItem
    }
  }
  ${PREVIOUS_PAPERS_HIERARCHY_FRAGMENT}
`;

export const UPDATE_PREVIOUS_PAPERS_QUESTION_COUNT = gql`
  mutation UpdatePreviousPapersQuestionCount($id: ID!, $count: Float!) {
    updatePreviousPapersQuestionCount(id: $id, count: $count) {
      ...PreviousPapersHierarchyItem
    }
  }
  ${PREVIOUS_PAPERS_HIERARCHY_FRAGMENT}
`;

export const GET_PREVIOUS_PAPERS_HIERARCHY_STATS = gql`
  query GetPreviousPapersHierarchyStats {
    previousPapersHierarchyStats {
      level
      type
      count
      totalQuestions
    }
  }
`;

export const PUBLISH_PREVIOUS_PAPERS_HIERARCHY_ITEM = gql`
  mutation PublishPreviousPapersHierarchyItem($id: ID!) {
    publishPreviousPapersHierarchyItem(id: $id) {
      ...PreviousPapersHierarchyItem
    }
  }
  ${PREVIOUS_PAPERS_HIERARCHY_FRAGMENT}
`;

// Note: These queries need to be implemented in the backend schema
// export const GET_PREVIOUS_PAPERS_HIERARCHY_BREADCRUMB = gql`...`
// export const GET_PREVIOUS_PAPERS_BY_HIERARCHY = gql`...`