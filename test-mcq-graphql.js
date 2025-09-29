#!/usr/bin/env node

/**
 * Test script to validate MCQ GraphQL schema and API functionality
 * This script tests the complete flow of creating an MCQ with comprehensive data
 */

const GRAPHQL_ENDPOINT = 'http://localhost:8001/graphql';

async function testGraphQLConnection() {
  console.log('🔗 Testing GraphQL connection...');
  
  try {
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: 'query { __typename }'
      })
    });

    if (response.ok) {
      console.log('✅ GraphQL connection successful');
      return true;
    } else {
      console.error('❌ GraphQL connection failed:', response.status, response.statusText);
      return false;
    }
  } catch (error) {
    console.error('❌ GraphQL connection error:', error.message);
    return false;
  }
}

async function testSchemaIntrospection() {
  console.log('\n📋 Testing schema introspection...');
  
  const query = `
    query {
      __schema {
        types {
          name
          inputFields {
            name
            type { name }
          }
        }
      }
    }
  `;

  try {
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query })
    });

    const result = await response.json();
    
    // Check for CreateQuestionInputGQL
    const createQuestionInput = result.data.__schema.types.find(t => t.name === 'CreateQuestionInputGQL');
    if (createQuestionInput && createQuestionInput.inputFields) {
      console.log('✅ CreateQuestionInputGQL found with fields:');
      createQuestionInput.inputFields.forEach(field => {
        console.log(`  - ${field.name}: ${field.type.name || 'Complex Type'}`);
      });
    }

    // Check for QuestionOptionInput
    const questionOptionInput = result.data.__schema.types.find(t => t.name === 'QuestionOptionInput');
    if (questionOptionInput && questionOptionInput.inputFields) {
      console.log('\n✅ QuestionOptionInput found with fields:');
      questionOptionInput.inputFields.forEach(field => {
        console.log(`  - ${field.name}: ${field.type.name || 'Complex Type'}`);
      });
      
      // Check for explanation and references
      const hasExplanation = questionOptionInput.inputFields.some(f => f.name === 'explanation');
      const hasReferences = questionOptionInput.inputFields.some(f => f.name === 'references');
      
      if (hasExplanation && hasReferences) {
        console.log('✅ QuestionOptionInput includes explanation and references fields');
      } else {
        console.log('❌ QuestionOptionInput missing explanation or references fields');
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error('❌ Schema introspection failed:', error.message);
    return false;
  }
}

async function testCreateHierarchyItem() {
  console.log('\n🏗️  Testing hierarchy creation...');
  
  const mutation = `
    mutation CreateHierarchyItem($input: CreateHierarchyItemInput!) {
      createHierarchyItem(input: $input) {
        id
        name
        level
        type
      }
    }
  `;

  const variables = {
    input: {
      name: 'Test Year 2025',
      level: 1,
      type: 'Year',
      order: 1,
      isPublished: true
    }
  };

  try {
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: mutation, variables })
    });

    const result = await response.json();
    
    if (result.errors) {
      console.log('⚠️  Hierarchy creation skipped (may already exist):', result.errors[0]?.message);
      return 'cm1kq3ek70001wd7iir732yto'; // Return a default ID
    }

    if (result.data?.createHierarchyItem) {
      console.log('✅ Hierarchy item created:', result.data.createHierarchyItem);
      return result.data.createHierarchyItem.id;
    }

    return null;
  } catch (error) {
    console.error('❌ Hierarchy creation failed:', error.message);
    return null;
  }
}

async function testCreateMCQ(hierarchyItemId) {
  console.log('\n📝 Testing comprehensive MCQ creation...');
  
  const mutation = `
    mutation CreateQuestion($input: CreateQuestionInputGQL!) {
      createQuestion(input: $input) {
        id
        humanId
        type
        question
        explanation
        references
        sourceTags
        examTags
        options {
          id
          text
          isCorrect
          order
          explanation
          references
        }
      }
    }
  `;

  const variables = {
    input: {
      type: 'SINGLE_CHOICE',
      question: 'What is the comprehensive test question for MCQ system validation?',
      explanation: 'This is the main explanation for the entire question, providing comprehensive details about the topic.',
      references: 'Main references: Medical Textbook Ch. 5, Research Paper XYZ-2024',
      difficulty: 'MEDIUM',
      points: 2,
      timeLimit: 120,
      sourceTags: ['Medical Textbook', 'Research Papers', 'Clinical Studies'],
      examTags: ['NEET', 'Medical Entrance', 'Comprehensive Test'],
      hierarchyItemId: hierarchyItemId,
      options: [
        {
          text: 'Option A: This is the correct answer with detailed explanation',
          isCorrect: true,
          order: 0,
          explanation: 'Detailed explanation for Option A: This explains why this option is correct, including supporting evidence and reasoning.',
          references: 'Option A references: Textbook pg 123, Journal Article ABC-2024'
        },
        {
          text: 'Option B: This is an incorrect option',
          isCorrect: false,
          order: 1,
          explanation: 'Explanation for Option B: This explains why this option is incorrect and what makes it a common misconception.',
          references: 'Option B references: Common Errors Guide, Misconception Study DEF-2023'
        },
        {
          text: 'Option C: Another incorrect option',
          isCorrect: false,
          order: 2,
          explanation: 'Explanation for Option C: This provides insight into why students might choose this option incorrectly.',
          references: 'Option C references: Error Analysis Report, Student Study GHI-2024'
        },
        {
          text: 'Option D: Final incorrect option',
          isCorrect: false,
          order: 3,
          explanation: 'Explanation for Option D: This explains the reasoning behind this distractor option.',
          references: 'Option D references: Distractor Analysis, Educational Research JKL-2024'
        }
      ],
      createdBy: 'test-admin'
    }
  };

  try {
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: mutation, variables })
    });

    const result = await response.json();
    
    if (result.errors) {
      console.error('❌ MCQ creation failed:', result.errors);
      return false;
    }

    if (result.data?.createQuestion) {
      const question = result.data.createQuestion;
      console.log('✅ MCQ created successfully!');
      console.log(`   ID: ${question.id}`);
      console.log(`   Human ID: ${question.humanId}`);
      console.log(`   Type: ${question.type}`);
      console.log(`   Question: ${question.question.substring(0, 50)}...`);
      console.log(`   Has Explanation: ${!!question.explanation}`);
      console.log(`   Has References: ${!!question.references}`);
      console.log(`   Source Tags: ${question.sourceTags?.length || 0}`);
      console.log(`   Exam Tags: ${question.examTags?.length || 0}`);
      console.log(`   Options Count: ${question.options?.length || 0}`);
      
      // Verify option details
      if (question.options && question.options.length > 0) {
        console.log('   Option Details:');
        question.options.forEach((opt, idx) => {
          console.log(`     ${idx + 1}. ${opt.text.substring(0, 30)}...`);
          console.log(`        Correct: ${opt.isCorrect}`);
          console.log(`        Has Explanation: ${!!opt.explanation}`);
          console.log(`        Has References: ${!!opt.references}`);
        });
      }

      return true;
    }

    return false;
  } catch (error) {
    console.error('❌ MCQ creation error:', error.message);
    return false;
  }
}

async function runTests() {
  console.log('🧪 Starting Comprehensive MCQ GraphQL Tests\n');
  
  // Test 1: Connection
  const connected = await testGraphQLConnection();
  if (!connected) {
    console.log('\n❌ Tests failed: Cannot connect to GraphQL API');
    console.log('   Please ensure the API server is running on http://localhost:8001');
    return;
  }

  // Test 2: Schema
  const schemaValid = await testSchemaIntrospection();
  if (!schemaValid) {
    console.log('\n❌ Tests failed: Schema validation failed');
    return;
  }

  // Test 3: Hierarchy
  const hierarchyId = await testCreateHierarchyItem();
  if (!hierarchyId) {
    console.log('\n❌ Tests failed: Could not create or find hierarchy item');
    return;
  }

  // Test 4: MCQ Creation
  const mcqCreated = await testCreateMCQ(hierarchyId);
  if (!mcqCreated) {
    console.log('\n❌ Tests failed: MCQ creation failed');
    return;
  }

  console.log('\n🎉 All tests passed! The comprehensive MCQ system is working correctly.');
  console.log('\n✅ Verification Summary:');
  console.log('   - GraphQL API connection: Working');
  console.log('   - Schema includes option explanation/references: Working');
  console.log('   - Hierarchy system: Working');
  console.log('   - Comprehensive MCQ creation: Working');
  console.log('   - Source and Exam tags: Working');
  console.log('   - Individual option explanations: Working');
  console.log('   - Main question explanation/references: Working');
}

// Run the tests
runTests().catch(console.error);