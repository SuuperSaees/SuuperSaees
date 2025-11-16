import sys
import subprocess
from openai import OpenAI
from transformers import pipeline 
# Config and init OpenAI
client = OpenAI(
    # api_key='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',
    api_key="your-api-key-here"
)

def get_branch_type(branch_name):
    if 'hotfix' in branch_name:
        return 'hotfix'
    elif 'bug' in branch_name or 'bugfix' in branch_name:
        return 'bugfix'
    elif 'feature' in branch_name or 'feat' in branch_name:
        return 'feature'
    elif 'fix' in branch_name:
        return 'bugfix'
    else:
        return 'refactor'
    
def suggest_branch_name_with_huggingface(prompt):
    try:
        # Attempt to import the necessary dependencies
        generator = pipeline('text-generation', model='gpt2')
        response = generator(f"Suggest a short, descriptive branch name for: {prompt}", 
                             max_length=30, 
                             num_return_sequences=1,
                             truncation=True)
        suggested_name = response[0]['generated_text'].split(':')[-1].strip()
        # Clean up the suggested name
        suggested_name = ''.join(e if e.isalnum() or e in ['-', '_', ' '] else ' ' for e in suggested_name)
        # Split by spaces and remove empty or whitespace-only entries
        name_parts = [part.strip() for part in suggested_name.split() if part.strip()]
        # Join the parts with hyphens
        suggested_name = '-'.join(name_parts)
        return suggested_name.lower()
    except ImportError:
        print("Error: The necessary dependencies for Hugging Face are not installed.")
        print("Please install the required packages with:")
        print("pip install transformers torch")
        return None
    except Exception as e:
        print(f"Error with Hugging Face: {e}")
        return None

def suggest_branch_name_with_openai(prompt):
    try:
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": "You are a helpful assistant."},
                {"role": "user", "content": f"Suggest a better branch name for: {prompt}"}
            ]
        )
        return response.choices[0].message['content'].strip()
    except Exception as e:
        print(f"Error with OpenAI: {e}")
        return None
    
def suggest_branch_name(prompt):
    while True:
        choice = input("Choose an option for branch naming:\n"
                       "(1) OpenAI\n"
                       "(2) Hugging Face Local AI\n"
                       "(3) Simple fallback (use original input)\n"
                       "Your choice: ").strip()
        if choice == '1':
            return suggest_branch_name_with_openai(prompt)
        elif choice == '2':
            result = suggest_branch_name_with_huggingface(prompt)
            if result is None:
                print("Returning to selection menu...")
            else:
                return result
        elif choice == '3':
            return create_fallback_name(prompt)
        else:
            print("Invalid option. Please choose 1, 2, or 3.")

def create_fallback_name(prompt):
    fallback_name = '-'.join(prompt.lower().split())
    fallback_name = '-'.join(fallback_name.split('-')[:4])
    return fallback_name
   
def main():
    if len(sys.argv) < 2:
        print("Usage: python script.py <branch-name>")
        sys.exit(1)

    # Concatenate all arguments to form the full branch name
    branch_name = ' '.join(sys.argv[1:]).lower()
    branch_type = get_branch_type(branch_name)

    if branch_type == 'hotfix':
        subprocess.run(['git', 'checkout', 'main'])
        subprocess.run(['git', 'pull'])

    # Remove the branch type from the prompt
    prompt_without_type = branch_name.replace(branch_type, '').strip()

    suggested_name = suggest_branch_name(prompt_without_type)
    if not suggested_name:
        print("Failed to generate a branch name. Please try again.")
        sys.exit(1)


    print(f"Suggested branch name: {branch_type}/{suggested_name}")
    user_input = input("Do you like this name? (y/n): ").strip().lower()
    if user_input != 'y':
        print("Process terminated by user.")
        sys.exit(0)

    final_branch_name = f"{branch_type}/{suggested_name}"
    subprocess.run(['git', 'checkout', '-b', final_branch_name])
    subprocess.run(['git', 'push', '-u', 'origin', final_branch_name])

if __name__ == "__main__":
    main()